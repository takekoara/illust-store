import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';

interface CartItem {
    id: number;
    product: {
        id: number;
        title: string;
        price: number;
        images: Array<{
            id: number;
            image_path: string;
            is_primary: boolean;
        }>;
    };
}

interface Props extends PageProps {
    cartItems: CartItem[];
    total: number;
    clientSecret?: string | null;
    tempOrderId?: number;
}

const stripeKey = import.meta.env.VITE_STRIPE_KEY;
const stripePromise = stripeKey ? loadStripe(stripeKey) : null;

function CheckoutForm({ cartItems, total, clientSecret, tempOrderId }: { cartItems: CartItem[]; total: number; clientSecret: string; tempOrderId?: number }) {
    const stripe = useStripe();
    const elements = useElements();
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const page = usePage();
    
    // Get CSRF token from shared props or meta tag
    const getCsrfToken = (): string => {
        const props = page.props as any;
        if (props.csrfToken) {
            return props.csrfToken;
        }
        const metaToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        if (metaToken) {
            return metaToken;
        }
        return '';
    };

    const { data, setData, post, processing: orderProcessing, errors } = useForm({
        billing_address: {
            name: '',
            email: '',
            address: '',
            city: '',
            postal_code: '',
            country: 'JP',
        },
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        if (!clientSecret) {
            setError('支払い情報の読み込みに失敗しました。ページを再読み込みしてください。');
            return;
        }

        setProcessing(true);
        setError(null);

        try {
            // First, submit the payment element to validate the form
            const { error: submitError } = await elements.submit();
            if (submitError) {
                setError(submitError.message || '支払い情報の検証に失敗しました。');
                setProcessing(false);
                return;
            }

            // Get CSRF token
            const csrfToken = getCsrfToken();
            
            // If CSRF token is not available, reload the page to get a fresh session
            if (!csrfToken) {
                setError('セッションが正しく開始されていません。ページをリロードしてください。');
                setProcessing(false);
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
                return;
            }

            // Update the temporary order with billing address
            const orderResponse = await fetch(route('orders.store'), {
                method: 'POST',
                credentials: 'same-origin', // send session cookie for CSRF/session validation
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': csrfToken,
                },
                body: JSON.stringify({
                    ...data,
                    temp_order_id: tempOrderId,
                }),
            });

            if (!orderResponse.ok) {
                // 419などHTMLレスポンスの場合も安全に扱う
                const contentType = orderResponse.headers.get('content-type') || '';
                
                // CSRFエラー（419）の場合、一時注文を削除
                if (orderResponse.status === 419 && tempOrderId) {
                    try {
                        await fetch(route('orders.cancel-temp'), {
                            method: 'POST',
                            credentials: 'same-origin',
                            headers: {
                                'Content-Type': 'application/json',
                                'X-Requested-With': 'XMLHttpRequest',
                                'X-CSRF-TOKEN':
                                    document
                                        .querySelector('meta[name="csrf-token"]')
                                        ?.getAttribute('content') || '',
                            },
                            body: JSON.stringify({
                                temp_order_id: tempOrderId,
                            }),
                        });
                    } catch (cancelError) {
                        console.error('Failed to cancel temp order:', cancelError);
                    }
                }
                
                if (contentType.includes('application/json')) {
                    const errorData = await orderResponse.json();
                    setError(errorData.message || '注文の作成に失敗しました。');
                } else {
                    const text = await orderResponse.text();
                    setError('注文の作成に失敗しました。ログイン状態とCSRFトークンを確認してください。');
                    console.error('Order create error response:', text);
                }
                setProcessing(false);
                return;
            }

            const orderData = await orderResponse.json();
            const orderId = orderData.order?.id || tempOrderId;

            // Build return URL directly
            const returnUrl = `${window.location.origin}/orders/${orderId}`;

            // Confirm payment with existing clientSecret
            const { error: stripeError } = await stripe.confirmPayment({
                elements,
                clientSecret,
                confirmParams: {
                    return_url: returnUrl,
                },
            });

            if (stripeError) {
                setError(stripeError.message || '支払い処理に失敗しました。');
                setProcessing(false);
            } else {
                // Payment succeeded, redirect will happen automatically
                router.visit(route('orders.show', orderId));
            }
        } catch (err: any) {
            setError(err.message || 'エラーが発生しました。');
            setProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Billing Address */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold">請求先情報</h3>

                <div>
                    <InputLabel htmlFor="name" value="お名前" />
                    <TextInput
                        id="name"
                        type="text"
                        value={data.billing_address.name}
                        className="mt-1 block w-full"
                        onChange={(e) =>
                            setData('billing_address', {
                                ...data.billing_address,
                                name: e.target.value,
                            })
                        }
                        required
                    />
                    <InputError message={errors['billing_address.name']} className="mt-2" />
                </div>

                <div>
                    <InputLabel htmlFor="email" value="メールアドレス" />
                    <TextInput
                        id="email"
                        type="email"
                        value={data.billing_address.email}
                        className="mt-1 block w-full"
                        onChange={(e) =>
                            setData('billing_address', {
                                ...data.billing_address,
                                email: e.target.value,
                            })
                        }
                        required
                    />
                    <InputError message={errors['billing_address.email']} className="mt-2" />
                </div>

                <div>
                    <InputLabel htmlFor="address" value="住所" />
                    <TextInput
                        id="address"
                        type="text"
                        value={data.billing_address.address}
                        className="mt-1 block w-full"
                        onChange={(e) =>
                            setData('billing_address', {
                                ...data.billing_address,
                                address: e.target.value,
                            })
                        }
                        required
                    />
                    <InputError message={errors['billing_address.address']} className="mt-2" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <InputLabel htmlFor="city" value="市区町村" />
                        <TextInput
                            id="city"
                            type="text"
                            value={data.billing_address.city}
                            className="mt-1 block w-full"
                            onChange={(e) =>
                                setData('billing_address', {
                                    ...data.billing_address,
                                    city: e.target.value,
                                })
                            }
                            required
                        />
                        <InputError message={errors['billing_address.city']} className="mt-2" />
                    </div>

                    <div>
                        <InputLabel htmlFor="postal_code" value="郵便番号" />
                        <TextInput
                            id="postal_code"
                            type="text"
                            value={data.billing_address.postal_code}
                            className="mt-1 block w-full"
                            onChange={(e) =>
                                setData('billing_address', {
                                    ...data.billing_address,
                                    postal_code: e.target.value,
                                })
                            }
                            required
                        />
                        <InputError
                            message={errors['billing_address.postal_code']}
                            className="mt-2"
                        />
                    </div>
                </div>
            </div>

            {/* Payment Element */}
            {clientSecret && (
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">支払い情報</h3>
                    
                    {/* テストカード情報 */}
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                        <p className="text-sm font-semibold text-blue-800 mb-2">
                            💳 テスト用カード情報（デモサイト用）
                        </p>
                        <div className="space-y-1 text-sm text-blue-700">
                            <div>
                                <strong>成功:</strong>{' '}
                                <code className="bg-blue-100 px-2 py-1 rounded text-xs">4242 4242 4242 4242</code>
                            </div>
                            <div>
                                <strong>3Dセキュア認証:</strong>{' '}
                                <code className="bg-blue-100 px-2 py-1 rounded text-xs">4000 0025 0000 3155</code>
                            </div>
                            <div>
                                <strong>失敗:</strong>{' '}
                                <code className="bg-blue-100 px-2 py-1 rounded text-xs">4000 0000 0000 0002</code>
                            </div>
                            <div className="mt-2 text-xs text-blue-600">
                                有効期限: 任意の未来の日付（例: 12/34） | CVC: 任意の3桁（例: 123）
                            </div>
                        </div>
                    </div>
                    
                    <div className="rounded-lg border p-4">
                        <PaymentElement />
                    </div>
                </div>
            )}

            {error && (
                <div className="rounded-lg bg-red-50 p-4 text-red-600">{error}</div>
            )}

            <PrimaryButton
                type="submit"
                disabled={!stripe || processing || orderProcessing}
                className="w-full"
            >
                {processing || orderProcessing ? '処理中...' : `¥${total.toLocaleString()} を支払う`}
            </PrimaryButton>
        </form>
    );
}

export default function Create({ cartItems, total, clientSecret, tempOrderId, auth }: Props) {
    useEffect(() => {
        if (cartItems.length === 0) {
            router.visit(route('cart.index'));
        }
    }, [cartItems.length]);

    if (cartItems.length === 0) {
        return null;
    }

    const canRenderPayment = Boolean(clientSecret && stripePromise);
    const options = canRenderPayment
        ? {
              clientSecret: clientSecret as string,
              appearance: {
                  theme: 'stripe' as const,
              },
          }
        : undefined;

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    注文確認
                </h2>
            }
        >
            <Head title="注文確認" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        <div className="lg:col-span-2">
                            <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                                <div className="p-6">
                                    {canRenderPayment ? (
                                        <Elements stripe={stripePromise!} options={options}>
                                            <CheckoutForm
                                                cartItems={cartItems}
                                                total={total}
                                                clientSecret={clientSecret!}
                                                tempOrderId={tempOrderId}
                                            />
                                        </Elements>
                                    ) : (
                                        <div className="text-center py-8">
                                            {!stripeKey ? (
                                                <>
                                                    <p className="text-gray-500">Stripeの公開鍵が設定されていません。</p>
                                                    <p className="text-sm text-gray-400 mt-2">
                                                        環境変数 VITE_STRIPE_KEY を設定してから再読み込みしてください。
                                                    </p>
                                                </>
                                            ) : (
                                                <>
                                                    <p className="text-gray-500">支払い情報を読み込んでいます...</p>
                                                    <p className="text-sm text-gray-400 mt-2">Stripeの設定を確認してください</p>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-1">
                            <div className="sticky top-4 overflow-hidden bg-white shadow-sm sm:rounded-lg">
                                <div className="p-6">
                                    <h3 className="mb-4 text-lg font-semibold">注文内容</h3>
                                    <div className="space-y-4">
                                        {cartItems.map((item) => {
                                            const primaryImage =
                                                item.product.images.find(
                                                    (img) => img.is_primary
                                                ) || item.product.images[0];
                                            const imageUrl = primaryImage
                                                ? `/images/${primaryImage.image_path}`
                                                : '/placeholder-image.jpg';

                                            return (
                                                <div key={item.id} className="flex gap-3">
                                                    <img
                                                        src={imageUrl}
                                                        alt={item.product.title}
                                                        className="h-16 w-16 rounded-lg object-cover"
                                                    />
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium">
                                                            {item.product.title}
                                                        </p>
                                                        <p className="text-sm text-gray-500">
                                                            ¥{item.product.price.toLocaleString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className="mt-4 border-t pt-4">
                                        <div className="flex justify-between">
                                            <span className="font-semibold">合計</span>
                                            <span className="text-lg font-bold text-indigo-600">
                                                ¥{total.toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}


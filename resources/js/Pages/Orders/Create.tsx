import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, useStripe, useElements } from '@stripe/react-stripe-js';
import PrimaryButton from '@/Components/PrimaryButton';

// Shared & Local Components
import { CartItem, BillingAddress } from './shared/types';
import { BillingAddressForm, OrderSummary, PaymentSection } from './Create/index';

interface Props extends PageProps {
    cartItems: CartItem[];
    total: number;
    clientSecret?: string | null;
    tempOrderId?: number;
}

const stripeKey = import.meta.env.VITE_STRIPE_KEY;
const stripePromise = stripeKey ? loadStripe(stripeKey) : null;

// Checkout Form Component
function CheckoutForm({ total, clientSecret, tempOrderId }: { total: number; clientSecret: string; tempOrderId?: number }) {
    const stripe = useStripe();
    const elements = useElements();
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const page = usePage();

    const getCsrfToken = (): string => {
        const props = page.props as any;
        if (props.csrfToken) return props.csrfToken;
        return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
    };

    const { data, setData, processing: orderProcessing, errors } = useForm({
        billing_address: {
            name: '',
            email: '',
            address: '',
            city: '',
            postal_code: '',
            country: 'JP',
        } as BillingAddress,
    });

    const handleBillingChange = (field: keyof BillingAddress, value: string) => {
        setData('billing_address', { ...data.billing_address, [field]: value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!stripe || !elements || !clientSecret) {
            setError('支払い情報の読み込みに失敗しました。ページを再読み込みしてください。');
            return;
        }

        setProcessing(true);
        setError(null);

        try {
            const { error: submitError } = await elements.submit();
            if (submitError) {
                setError(submitError.message || '支払い情報の検証に失敗しました。');
                setProcessing(false);
                return;
            }

            const csrfToken = getCsrfToken();
            if (!csrfToken) {
                setError('セッションが正しく開始されていません。ページをリロードしてください。');
                setProcessing(false);
                setTimeout(() => window.location.reload(), 2000);
                return;
            }

            const orderResponse = await fetch(route('orders.store'), {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': csrfToken,
                },
                body: JSON.stringify({ ...data, temp_order_id: tempOrderId }),
            });

            if (!orderResponse.ok) {
                if (orderResponse.status === 419 && tempOrderId) {
                    try {
                        await fetch(route('orders.cancel-temp'), {
                            method: 'POST',
                            credentials: 'same-origin',
                            headers: {
                                'Content-Type': 'application/json',
                                'X-Requested-With': 'XMLHttpRequest',
                                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                            },
                            body: JSON.stringify({ temp_order_id: tempOrderId }),
                        });
                    } catch (cancelError) {
                        console.error('Failed to cancel temp order:', cancelError);
                    }
                }

                const contentType = orderResponse.headers.get('content-type') || '';
                if (contentType.includes('application/json')) {
                    const errorData = await orderResponse.json();
                    setError(errorData.message || '注文の作成に失敗しました。');
                } else {
                    setError('注文の作成に失敗しました。ログイン状態とCSRFトークンを確認してください。');
                }
                setProcessing(false);
                return;
            }

            const orderData = await orderResponse.json();
            const orderId = orderData.order?.id || tempOrderId;
            const returnUrl = `${window.location.origin}/orders/${orderId}`;

            const { error: stripeError } = await stripe.confirmPayment({
                elements,
                clientSecret,
                confirmParams: { return_url: returnUrl },
            });

            if (stripeError) {
                setError(stripeError.message || '支払い処理に失敗しました。');
                setProcessing(false);
            } else {
                router.visit(route('orders.show', orderId));
            }
        } catch (err: any) {
            setError(err.message || 'エラーが発生しました。');
            setProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <BillingAddressForm
                data={data.billing_address}
                onChange={handleBillingChange}
                errors={errors}
            />

            <PaymentSection clientSecret={clientSecret} />

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

// Main Component
export default function Create({ cartItems, total, clientSecret, tempOrderId }: Props) {
    useEffect(() => {
        if (cartItems.length === 0) {
            router.visit(route('cart.index'));
        }
    }, [cartItems.length]);

    if (cartItems.length === 0) return null;

    const canRenderPayment = Boolean(clientSecret && stripePromise);
    const options = canRenderPayment
        ? { clientSecret: clientSecret as string, appearance: { theme: 'stripe' as const } }
        : undefined;

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">注文確認</h2>}
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
                            <OrderSummary cartItems={cartItems} total={total} />
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

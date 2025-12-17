import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import PrimaryButton from '@/Components/PrimaryButton';
import { useEffect } from 'react';

interface OrderItem {
    id: number;
    price: number;
    product: {
        id: number;
        title: string;
        images: Array<{
            id: number;
            image_path: string;
            is_primary: boolean;
        }>;
    } | null;
}

interface Order {
    id: number;
    order_number: string;
    total_amount: number;
    status: string;
    billing_address: {
        name: string;
        email: string;
        address: string;
        city: string;
        postal_code: string;
        country: string;
    } | null;
    created_at: string;
    items: OrderItem[];
    metadata?: {
        email_sent?: boolean;
        email_sent_at?: string;
    };
}

interface Props extends PageProps {
    order: Order;
    paymentSuccess?: boolean;
    stripePaymentStatus?: string | null;
}

const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
};

const statusLabels: Record<string, string> = {
    pending: '支払い待ち',
    processing: '処理中',
    completed: '完了',
    cancelled: 'キャンセル',
};

export default function Show({ order, paymentSuccess, emailSent, auth, stripePaymentStatus }: Props) {
    // Check if payment was successful from URL parameters
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const paymentIntent = urlParams.get('payment_intent');
        const redirectStatus = urlParams.get('redirect_status');

        if (paymentIntent && redirectStatus === 'succeeded') {
            // Payment succeeded, clean up URL
            window.history.replaceState({}, '', window.location.pathname);
        }
    }, []);

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    注文詳細 #{order.order_number}
                </h2>
            }
        >
            <Head title={`注文詳細 #${order.order_number}`} />

                   {(paymentSuccess || (stripePaymentStatus === 'succeeded' && order.status === 'pending')) && (
                       <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                           <div className="mb-4 space-y-2">
                               {stripePaymentStatus === 'succeeded' && order.status === 'pending' ? (
                                   <div className="rounded-lg bg-yellow-50 p-4 text-yellow-800">
                                       <p className="font-semibold">⚠️ 支払いは完了していますが、注文状態の更新に時間がかかっています</p>
                                       <p className="text-sm mt-1">
                                           ページをリロードすると、注文状態が自動的に更新されます。
                                       </p>
                                   </div>
                               ) : (
                                   <>
                                       <div className="rounded-lg bg-green-50 p-4 text-green-800">
                                           <p className="font-semibold">✓ 支払いが完了しました！</p>
                                       </div>
                                       {(emailSent || order.metadata?.email_sent || order.status === 'completed') && (
                                           <div className="rounded-lg bg-blue-50 p-4 text-blue-800">
                                               <p className="font-semibold">📧 注文確認メールを送信しました</p>
                                               <p className="text-sm mt-1">
                                                   {order.billing_address?.email || '登録メールアドレス'} に確認メールを送信しました。
                                               </p>
                                           </div>
                                       )}
                                   </>
                               )}
                           </div>
                       </div>
                   )}

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        <div className="lg:col-span-2">
                            <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                                <div className="p-6">
                                    <h3 className="mb-4 text-lg font-semibold">注文内容</h3>
                                    <div className="space-y-4">
                                        {order.items.map((item) => {
                                            if (!item.product) {
                                                return (
                                                    <div
                                                        key={item.id}
                                                        className="flex items-center gap-4 rounded-lg border p-4"
                                                    >
                                                        <div className="flex-1">
                                                            <p className="text-gray-500">商品情報が取得できませんでした</p>
                                                        </div>
                                                        <span className="text-lg font-semibold">
                                                            ¥{item.price.toLocaleString()}
                                                        </span>
                                                    </div>
                                                );
                                            }

                                            const primaryImage =
                                                item.product.images?.find(
                                                    (img) => img.is_primary
                                                ) || item.product.images?.[0];
                                            const imageUrl = primaryImage
                                                ? `/images/${primaryImage.image_path}`
                                                : '/placeholder-image.jpg';

                                            return (
                                                <div
                                                    key={item.id}
                                                    className="flex items-center gap-4 rounded-lg border p-4"
                                                >
                                                    <Link
                                                        href={route('products.show', item.product.id)}
                                                    >
                                                        <img
                                                            src={imageUrl}
                                                            alt={item.product.title}
                                                            className="h-20 w-20 rounded-lg object-cover"
                                                        />
                                                    </Link>
                                                    <div className="flex-1">
                                                        <Link
                                                            href={route('products.show', item.product.id)}
                                                            className="font-semibold text-gray-900 hover:text-indigo-600"
                                                        >
                                                            {item.product.title}
                                                        </Link>
                                                    </div>
                                                    <span className="text-lg font-semibold">
                                                        ¥{item.price.toLocaleString()}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-1">
                            <div className="space-y-6">
                                <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                                    <div className="p-6">
                                        <h3 className="mb-4 text-lg font-semibold">注文情報</h3>
                                        <div className="space-y-3">
                                            <div>
                                                <p className="text-sm text-gray-500">注文番号</p>
                                                <p className="font-semibold">{order.order_number}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">注文日</p>
                                                <p className="font-semibold">
                                                    {new Date(order.created_at).toLocaleDateString(
                                                        'ja-JP'
                                                    )}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">ステータス</p>
                                                <span
                                                    className={`inline-block rounded-full px-3 py-1 text-sm font-semibold ${
                                                        statusColors[order.status] ||
                                                        'bg-gray-100 text-gray-800'
                                                    }`}
                                                >
                                                    {statusLabels[order.status] || order.status}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">合計金額</p>
                                                <p className="text-xl font-bold text-indigo-600">
                                                    ¥{order.total_amount.toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {order.billing_address && (
                                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                                        <div className="p-6">
                                            <h3 className="mb-4 text-lg font-semibold">請求先</h3>
                                            <div className="space-y-2 text-sm">
                                                <p>
                                                    <span className="font-semibold">お名前:</span>{' '}
                                                    {order.billing_address.name}
                                                </p>
                                                <p>
                                                    <span className="font-semibold">メール:</span>{' '}
                                                    {order.billing_address.email}
                                                </p>
                                                <p>
                                                    <span className="font-semibold">住所:</span>{' '}
                                                    {order.billing_address.address}
                                                </p>
                                                <p>
                                                    {order.billing_address.city}{' '}
                                                    {order.billing_address.postal_code}
                                                </p>
                                                <p>
                                                    <span className="font-semibold">国:</span>{' '}
                                                    {order.billing_address.country}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="flex justify-center">
                                    <Link href={route('orders.index')}>
                                        <PrimaryButton>注文一覧に戻る</PrimaryButton>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}


import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { PageProps } from '@/types';
import PrimaryButton from '@/Components/PrimaryButton'; 


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
    };
}

interface Order {
    id: number;
    order_number: string;
    total_amount: number;
    status: string;
    created_at: string;
    items: OrderItem[];
}

interface Props extends PageProps {
    orders: {
        data: Order[];
        links: any;
        meta: any;
    };
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

export default function Index({ orders, auth }: Props) {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    注文履歴
                </h2>
            }
        >
            <Head title="注文履歴" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {orders.data.length === 0 ? (
                        <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                            <div className="p-8 text-center">
                                <p className="mb-4 text-gray-500">注文履歴がありません。</p>
                                <Link href={route('products.index')}>
                                    <PrimaryButton>商品を見る</PrimaryButton>
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {orders.data.map((order) => (
                                <div
                                    key={order.id}
                                    className="overflow-hidden bg-white shadow-sm sm:rounded-lg"
                                >
                                    <div className="p-6">
                                        <div className="mb-4 flex items-center justify-between">
                                            <div>
                                                <h3 className="text-lg font-semibold">
                                                    注文 #{order.order_number}
                                                </h3>
                                                <p className="text-sm text-gray-500">
                                                    {new Date(order.created_at).toLocaleDateString(
                                                        'ja-JP'
                                                    )}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <span
                                                    className={`rounded-full px-3 py-1 text-sm font-semibold ${
                                                        statusColors[order.status] ||
                                                        'bg-gray-100 text-gray-800'
                                                    }`}
                                                >
                                                    {statusLabels[order.status] || order.status}
                                                </span>
                                                <p className="mt-2 text-lg font-bold text-indigo-600">
                                                    ¥{order.total_amount.toLocaleString()}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            {order.items.map((item) => {
                                                const primaryImage =
                                                    item.product.images.find(
                                                        (img) => img.is_primary
                                                    ) || item.product.images[0];
                                                const imageUrl = primaryImage
                                                    ? `/storage/${primaryImage.image_path}`
                                                    : '/placeholder-image.jpg';

                                                return (
                                                    <div
                                                        key={item.id}
                                                        className="flex items-center gap-4 rounded-lg border p-3"
                                                    >
                                                        <Link
                                                            href={route('products.show', item.product.id)}
                                                        >
                                                            <img
                                                                src={imageUrl}
                                                                alt={item.product.title}
                                                                className="h-16 w-16 rounded-lg object-cover"
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
                                                        <span className="font-semibold">
                                                            ¥{item.price.toLocaleString()}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        <div className="mt-4">
                                            <Link
                                                href={route('orders.show', order.id)}
                                                className="text-indigo-600 hover:text-indigo-800"
                                            >
                                                詳細を見る →
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {orders.links && orders.links.length > 3 && (
                        <div className="mt-6 flex justify-center">
                            <nav className="flex gap-1">
                                {orders.links.map((link: any, index: number) => (
                                    <Link
                                        key={index}
                                        href={link.url || '#'}
                                        className={`px-4 py-2 rounded-md ${
                                            link.active
                                                ? 'bg-indigo-600 text-white'
                                                : 'bg-white text-gray-700 hover:bg-gray-50'
                                        } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </nav>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}


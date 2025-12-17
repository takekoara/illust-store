import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { PageProps, ProductListItem } from '@/types';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';

interface Order {
    id: number;
    order_number: string;
    total_amount: number;
    status: string;
    created_at: string;
    user?: {
        id: number;
        name: string;
        username: string;
    };
    items?: Array<{
        id: number;
        product: {
            id: number;
            title: string;
        };
    }>;
}

interface Stats {
    // Admin stats
    total_products?: number;
    active_products?: number;
    total_users?: number;
    total_orders?: number;
    total_revenue?: number;
    pending_orders?: number;
    recent_orders?: Order[];
    recent_products?: ProductListItem[];
    // User stats
    my_products?: number;
    my_active_products?: number;
    my_orders?: number;
    my_cart_items?: number;
    my_followers?: number;
    my_following?: number;
    my_bookmarks_count?: number; // Added
}

interface BookmarkProduct {
    id: number;
    title: string;
    price: number;
    images?: Array<{
        id: number;
        image_path: string;
        is_primary?: boolean;
    }>;
    user?: {
        id: number;
        name: string;
        username: string;
    };
}

interface Props extends PageProps {
    stats: Stats;
    isAdmin: boolean;
    bookmarks?: BookmarkProduct[];
}

export default function Dashboard({ stats, isAdmin, auth, bookmarks = [] }: Props) {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    ダッシュボード
                </h2>
            }
        >
            <Head title="ダッシュボード" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {isAdmin ? (
                        // Admin Dashboard
                        <div className="space-y-6">
                            {/* Statistics Cards */}
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                                <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                                    <div className="p-6">
                                        <div className="text-sm font-medium text-gray-500">
                                            総商品数
                                        </div>
                                        <div className="mt-2 text-3xl font-bold text-gray-900">
                                            {stats.total_products || 0}
                                        </div>
                                        <div className="mt-1 text-sm text-gray-600">
                                            有効: {stats.active_products || 0}
                                        </div>
                                    </div>
                                </div>

                                <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                                    <div className="p-6">
                                        <div className="text-sm font-medium text-gray-500">
                                            総ユーザー数
                                        </div>
                                        <div className="mt-2 text-3xl font-bold text-gray-900">
                                            {stats.total_users || 0}
                                        </div>
                                    </div>
                                </div>

                                <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                                    <div className="p-6">
                                        <div className="text-sm font-medium text-gray-500">
                                            総注文数
                                        </div>
                                        <div className="mt-2 text-3xl font-bold text-gray-900">
                                            {stats.total_orders || 0}
                                        </div>
                                        <div className="mt-1 text-sm text-gray-600">
                                            保留中: {stats.pending_orders || 0}
                                        </div>
                                    </div>
                                </div>

                                <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                                    <div className="p-6">
                                        <div className="text-sm font-medium text-gray-500">
                                            総売上
                                        </div>
                                        <div className="mt-2 text-3xl font-bold text-indigo-600">
                                            ¥{((stats.total_revenue || 0) / 1).toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                                <div className="p-6">
                                    <h3 className="mb-4 text-lg font-semibold">クイックアクション</h3>
                                    <div className="flex flex-wrap gap-3">
                                        <Link href={route('products.create')}>
                                            <PrimaryButton>新規商品作成</PrimaryButton>
                                        </Link>
                                        <Link href={route('products.my-products')}>
                                            <PrimaryButton>マイ商品管理</PrimaryButton>
                                        </Link>
                                        <Link href={route('products.index')}>
                                            <SecondaryButton>
                                                商品一覧
                                            </SecondaryButton>
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            {/* Recent Orders */}
                            {stats.recent_orders && stats.recent_orders.length > 0 && (
                                <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                                    <div className="p-6">
                                        <h3 className="mb-4 text-lg font-semibold">最近の注文</h3>
                                        <div className="space-y-3">
                                            {stats.recent_orders.map((order) => (
                                                <Link
                                                    key={order.id}
                                                    href={route('orders.show', order.id)}
                                                    className="block rounded-lg border p-4 transition-colors hover:bg-gray-50"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className="font-semibold text-gray-900">
                                                                #{order.order_number}
                                                            </p>
                                                            {order.user && (
                                                                <p className="text-sm text-gray-500">
                                                                    {order.user.username || order.user.name}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="font-semibold text-indigo-600">
                                                                ¥{order.total_amount.toLocaleString()}
                                                            </p>
                                                            <p className="text-sm text-gray-500">
                                                                {new Date(order.created_at).toLocaleDateString('ja-JP')}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Recent Products */}
                            {stats.recent_products && stats.recent_products.length > 0 && (
                                <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                                    <div className="p-6">
                                        <h3 className="mb-4 text-lg font-semibold">最近の商品</h3>
                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                            {stats.recent_products.map((product) => {
                                                const primaryImage =
                                                    product.images?.find((img) => img.is_primary) ||
                                                    product.images?.[0];
                                                const imageUrl = primaryImage
                                                    ? `/storage/${primaryImage.image_path}`
                                                    : '/placeholder-image.jpg';

                                                return (
                                                    <Link
                                                        key={product.id}
                                                        href={route('products.show', product.id)}
                                                        className="group overflow-hidden rounded-lg border transition-shadow hover:shadow-md"
                                                    >
                                                        <div className="aspect-square overflow-hidden bg-gray-100">
                                                            <img
                                                                src={imageUrl}
                                                                alt={product.title}
                                                                className="h-full w-full object-cover transition-transform group-hover:scale-105"
                                                            />
                                                        </div>
                                                        <div className="p-4">
                                                            <h4 className="mb-1 font-semibold text-gray-900 line-clamp-2">
                                                                {product.title}
                                                            </h4>
                                                            <p className="text-sm text-indigo-600">
                                                                ¥{product.price.toLocaleString()}
                                                            </p>
                                                            <p className="mt-1 text-xs text-gray-500">
                                                                {product.is_active ? '有効' : '無効'}
                                                            </p>
                                                        </div>
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        // User Dashboard
                        <div className="space-y-6">
                            {/* Statistics Cards */}
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                                    <div className="p-6">
                                        <div className="text-sm font-medium text-gray-500">
                                            マイ商品
                                        </div>
                                        <div className="mt-2 text-3xl font-bold text-gray-900">
                                            {stats.my_products || 0}
                                        </div>
                                        <div className="mt-1 text-sm text-gray-600">
                                            有効: {stats.my_active_products || 0}
                                        </div>
                                    </div>
                                </div>

                                <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                                    <div className="p-6">
                                        <div className="text-sm font-medium text-gray-500">
                                            注文数
                                        </div>
                                        <div className="mt-2 text-3xl font-bold text-gray-900">
                                            {stats.my_orders || 0}
                                        </div>
                                        <Link
                                            href={route('orders.index')}
                                            className="mt-2 text-sm text-indigo-600 hover:text-indigo-800"
                                        >
                                            注文履歴を見る →
                                        </Link>
                                    </div>
                                </div>

                                <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                                    <div className="p-6">
                                        <div className="text-sm font-medium text-gray-500">
                                            カート
                                        </div>
                                        <div className="mt-2 text-3xl font-bold text-gray-900">
                                            {stats.my_cart_items || 0}
                                        </div>
                                        <Link
                                            href={route('cart.index')}
                                            className="mt-2 text-sm text-indigo-600 hover:text-indigo-800"
                                        >
                                            カートを見る →
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            {/* Follow/Bookmark Cards */}
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                <Link
                                    href={route('followers', auth.user.id)}
                                    className="group overflow-hidden rounded-lg bg-white shadow-sm transition-shadow hover:shadow-md"
                                >
                                    <div className="p-6">
                                        <div className="text-sm font-medium text-gray-500">
                                            フォロワー
                                        </div>
                                        <div className="mt-2 text-3xl font-bold text-gray-900">
                                            {stats.my_followers || 0}
                                        </div>
                                        <p className="mt-2 text-sm text-indigo-600 group-hover:text-indigo-800">
                                            フォロワーを見る →
                                        </p>
                                    </div>
                                </Link>

                                <Link
                                    href={route('following', auth.user.id)}
                                    className="group overflow-hidden rounded-lg bg-white shadow-sm transition-shadow hover:shadow-md"
                                >
                                    <div className="p-6">
                                        <div className="text-sm font-medium text-gray-500">
                                            フォロー中
                                        </div>
                                        <div className="mt-2 text-3xl font-bold text-gray-900">
                                            {stats.my_following || 0}
                                        </div>
                                        <p className="mt-2 text-sm text-indigo-600 group-hover:text-indigo-800">
                                            フォロー中を見る →
                                        </p>
                                    </div>
                                </Link>

                                <Link
                                    href={route('bookmarks.index')}
                                    className="group overflow-hidden rounded-lg bg-white shadow-sm transition-shadow hover:shadow-md"
                                >
                                    <div className="p-6">
                                        <div className="text-sm font-medium text-gray-500">
                                            ブックマーク
                                        </div>
                                        <div className="mt-2 text-3xl font-bold text-gray-900">
                                            {stats.my_bookmarks_count || 0}
                                        </div>
                                        <p className="mt-2 text-sm text-indigo-600 group-hover:text-indigo-800">
                                            ブックマークを見る →
                                        </p>
                                    </div>
                                </Link>
                            </div>

                            {/* Recent Orders */}
                            {stats.recent_orders && stats.recent_orders.length > 0 && (
                                <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                                    <div className="p-6">
                                        <div className="mb-4 flex items-center justify-between">
                                            <h3 className="text-lg font-semibold">最近の注文</h3>
                                            <Link
                                                href={route('orders.index')}
                                                className="text-sm text-indigo-600 hover:text-indigo-800"
                                            >
                                                すべて見る →
                                            </Link>
                                        </div>
                                        <div className="space-y-3">
                                            {stats.recent_orders.map((order) => (
                                                <Link
                                                    key={order.id}
                                                    href={route('orders.show', order.id)}
                                                    className="block rounded-lg border p-4 transition-colors hover:bg-gray-50"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className="font-semibold text-gray-900">
                                                                #{order.order_number}
                                                            </p>
                                                            <p className="text-sm text-gray-500">
                                                                {new Date(order.created_at).toLocaleDateString('ja-JP')}
                                                            </p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="font-semibold text-indigo-600">
                                                                ¥{order.total_amount.toLocaleString()}
                                                            </p>
                                                            <p className="text-sm text-gray-500">
                                                                {order.status === 'completed'
                                                                    ? '完了'
                                                                    : order.status === 'pending'
                                                                    ? '保留中'
                                                                    : order.status}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ブックマーク一覧 */}
                            {bookmarks.length > 0 && (
                                <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                                    <div className="p-6">
                                        <div className="mb-4 flex items-center justify-between">
                                            <h3 className="text-lg font-semibold">ブックマーク</h3>
                                            <Link
                                                href={route('bookmarks.index')}
                                                className="text-sm text-indigo-600 hover:text-indigo-800"
                                            >
                                                すべて見る →
                                            </Link>
                                        </div>
                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                            {bookmarks.slice(0, 6).map((product) => {
                                                const primaryImage =
                                                    product.images?.find((img) => img.is_primary) ||
                                                    product.images?.[0];
                                                const imageUrl = primaryImage
                                                    ? `/storage/${primaryImage.image_path}`
                                                    : '/placeholder-image.jpg';

                                                return (
                                                    <Link
                                                        key={product.id}
                                                        href={route('products.show', product.id)}
                                                        className="group overflow-hidden rounded-lg border transition-shadow hover:shadow-md"
                                                    >
                                                        <div className="aspect-square overflow-hidden bg-gray-100">
                                                            <img
                                                                src={imageUrl}
                                                                alt={product.title}
                                                                className="h-full w-full object-cover transition-transform group-hover:scale-105"
                                                            />
                                                        </div>
                                                        <div className="p-4">
                                                            <h4 className="mb-1 font-semibold text-gray-900 line-clamp-2">
                                                                {product.title}
                                                            </h4>
                                                            <p className="text-sm text-indigo-600">
                                                                ¥{product.price.toLocaleString()}
                                                            </p>
                                                            {product.user && (
                                                                <p className="mt-1 text-xs text-gray-500">
                                                                    {product.user.username || product.user.name}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

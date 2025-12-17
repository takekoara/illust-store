import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { PageProps } from '@/types';

interface BookmarkProduct {
    id: number;
    title: string;
    price: number;
    user: {
        id: number;
        name: string;
        username: string;
        avatar: string | null;
        avatar_type?: string | null;
    };
    images: Array<{
        id: number;
        image_path: string;
        is_primary: boolean;
    }>;
    tags?: Array<{
        id: number;
        name: string;
    }>;
}

interface Bookmark {
    id: number;
    created_at: string;
    product: BookmarkProduct;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginationMeta {
    current_page: number;
    from: number;
    last_page: number;
    per_page: number;
    to: number;
    total: number;
}

interface PaginatedBookmarks {
    data: Bookmark[];
    links: PaginationLink[];
    meta: PaginationMeta;
}

interface Props extends PageProps {
    bookmarks: PaginatedBookmarks;
}

export default function Index({ bookmarks, auth }: Props) {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    ブックマーク
                </h2>
            }
        >
            <Head title="ブックマーク" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {!bookmarks?.data || bookmarks.data.length === 0 ? (
                        <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                            <div className="p-8 text-center">
                                <p className="mb-4 text-gray-500">ブックマークがありません。</p>
                                <Link
                                    href={route('products.index')}
                                    className="inline-block rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                                >
                                    商品を見る
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <>
                            {bookmarks.meta?.total && (
                                <div className="mb-6">
                                    <p className="text-sm text-gray-600">
                                        全{bookmarks.meta.total}件のブックマーク
                                    </p>
                                </div>
                            )}
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {bookmarks.data.map((bookmark) => {
                                    const primaryImage =
                                        bookmark.product.images?.find((img) => img.is_primary) ||
                                        bookmark.product.images?.[0];
                                    const imageUrl = primaryImage
                                        ? `/images/${primaryImage.image_path}`
                                        : '/placeholder-image.jpg';

                                    return (
                                        <Link
                                            key={bookmark.id}
                                            href={route('products.show', bookmark.product.id)}
                                            className="group overflow-hidden rounded-lg bg-white shadow-sm transition-shadow hover:shadow-md"
                                        >
                                            <div className="aspect-square overflow-hidden bg-gray-100">
                                                <img
                                                    src={imageUrl}
                                                    alt={bookmark.product.title}
                                                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                                                />
                                            </div>
                                            <div className="p-4">
                                                <h4 className="mb-1 font-semibold text-gray-900 line-clamp-2">
                                                    {bookmark.product.title}
                                                </h4>
                                                <p className="text-sm text-indigo-600">
                                                    ¥{bookmark.product.price.toLocaleString()}
                                                </p>
                                                {bookmark.product.user && (
                                                    <div className="mt-2 flex items-center gap-2">
                                                        <img
                                                            src={
                                                                bookmark.product.user.avatar_type
                                                                    ? `/images/avatars/${bookmark.product.user.avatar_type}.png`
                                                                    : '/images/avatars/default-avatar.png'
                                                            }
                                                            alt={bookmark.product.user.name}
                                                            className="h-5 w-5 rounded-full"
                                                            onError={(e) => {
                                                                (e.target as HTMLImageElement).src = '/images/avatars/default-avatar.png';
                                                            }}
                                                        />
                                                        <p className="text-xs text-gray-500">
                                                            {bookmark.product.user.username || bookmark.product.user.name}
                                                        </p>
                                                    </div>
                                                )}
                                                <p className="mt-1 text-xs text-gray-400">
                                                    {new Date(bookmark.created_at).toLocaleDateString('ja-JP')}
                                                </p>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>

                            {/* ページネーション */}
                            {bookmarks.links && bookmarks.links.length > 3 && (
                                <div className="mt-6 flex justify-center">
                                    <nav className="flex gap-2">
                                        {bookmarks.links.map((link: any, index: number) => (
                                            <Link
                                                key={index}
                                                href={link.url || '#'}
                                                className={`rounded px-3 py-2 text-sm ${
                                                    link.active
                                                        ? 'bg-indigo-600 text-white'
                                                        : 'bg-white text-gray-700 hover:bg-gray-50'
                                                } ${!link.url ? 'pointer-events-none opacity-50' : ''}`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ))}
                                    </nav>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}


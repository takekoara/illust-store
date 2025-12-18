import { Link } from '@inertiajs/react';

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
}

interface BookmarkCardProps {
    bookmark: {
        id: number;
        created_at: string;
        product: BookmarkProduct;
    };
}

export function BookmarkCard({ bookmark }: BookmarkCardProps) {
    const primaryImage =
        bookmark.product.images?.find((img) => img.is_primary) ||
        bookmark.product.images?.[0];
    const imageUrl = primaryImage
        ? `/images/${primaryImage.image_path}`
        : '/placeholder-image.jpg';

    const avatarUrl = bookmark.product.user.avatar_type
        ? `/images/avatars/${bookmark.product.user.avatar_type}.png`
        : '/images/avatars/default-avatar.png';

    return (
        <Link
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
                            src={avatarUrl}
                            alt={bookmark.product.user.name}
                            className="h-5 w-5 rounded-full"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                    '/images/avatars/default-avatar.png';
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
}


import { Link } from '@inertiajs/react';
import { Product } from '@/types';

interface ProductCardProps {
    product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
    const primaryImage = product.images.find(img => img.is_primary) || product.images[0];
    const imageUrl = primaryImage
        ? `/images/${primaryImage.image_path}`
        : '/placeholder-image.jpg';

    return (
        <Link
            href={route('products.show', product.id)}
            className="group overflow-hidden rounded-lg bg-white shadow-sm transition-shadow hover:shadow-md"
        >
            <div className="aspect-square overflow-hidden bg-gray-100">
                <img
                    src={imageUrl}
                    alt={product.title}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
            </div>
            <div className="p-4">
                <h3 className="mb-2 text-lg font-semibold text-gray-900 line-clamp-2">
                    {product.title}
                </h3>
                <ProductCardUser user={product.user} />
                <ProductCardPriceStats
                    price={product.price}
                    views={product.views}
                    salesCount={product.sales_count}
                />
                <ProductCardTags tags={product.tags} />
            </div>
        </Link>
    );
}

// Sub-components
interface ProductCardUserProps {
    user: Product['user'];
}

function ProductCardUser({ user }: ProductCardUserProps) {
    return (
        <div className="mb-2 flex items-center gap-2">
            <img
                src={user.avatar_type ? `/images/avatars/${user.avatar_type}.png` : '/images/avatars/default-avatar.png'}
                alt={user.name}
                className="h-6 w-6 rounded-full"
                onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/avatars/default-avatar.png';
                }}
            />
            <span className="text-sm text-gray-600">
                {user.username || user.name}
            </span>
        </div>
    );
}

interface ProductCardPriceStatsProps {
    price: number;
    views: number;
    salesCount: number;
}

function ProductCardPriceStats({ price, views, salesCount }: ProductCardPriceStatsProps) {
    return (
        <div className="flex items-center justify-between">
            <span className="text-xl font-bold text-indigo-600">
                ¥{price.toLocaleString()}
            </span>
            <div className="flex gap-4 text-sm text-gray-500">
                <span>👁 {views}</span>
                <span>💰 {salesCount}</span>
            </div>
        </div>
    );
}

interface ProductCardTagsProps {
    tags: Product['tags'];
}

function ProductCardTags({ tags }: ProductCardTagsProps) {
    if (tags.length === 0) return null;

    return (
        <div className="mt-2 flex flex-wrap gap-1">
            {tags.slice(0, 3).map((tag) => (
                <span
                    key={tag.id}
                    className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600"
                >
                    #{tag.name}
                </span>
            ))}
        </div>
    );
}


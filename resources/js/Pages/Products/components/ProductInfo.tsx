import { Link } from '@inertiajs/react';
import { Product } from '@/types';

interface ProductInfoProps {
    product: Product;
}

export function ProductInfo({ product }: ProductInfoProps) {
    return (
        <>
            {/* User Info */}
            <div className="mb-4 flex items-center gap-3">
                <img
                    src={product.user.avatar_type ? `/images/avatars/${product.user.avatar_type}.png` : '/images/avatars/default-avatar.png'}
                    alt={product.user.name}
                    className="h-12 w-12 rounded-full"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/avatars/default-avatar.png';
                    }}
                />
                <div>
                    <Link
                        href={`/users/${product.user.id}`}
                        className="font-semibold text-gray-900 hover:text-indigo-600"
                    >
                        {product.user.username || product.user.name}
                    </Link>
                    <div className="text-sm text-gray-500">
                        {product.views} 閲覧 • {product.sales_count} 販売
                    </div>
                </div>
            </div>

            {/* Title */}
            <h1 className="mb-4 text-3xl font-bold text-gray-900">
                {product.title}
            </h1>

            {/* Price */}
            <div className="mb-6">
                <span className="text-4xl font-bold text-indigo-600">
                    ¥{product.price.toLocaleString()}
                </span>
            </div>

            {/* Description */}
            {product.description && (
                <div className="mb-6">
                    <h3 className="mb-2 font-semibold text-gray-900">説明</h3>
                    <p className="whitespace-pre-wrap text-gray-700">
                        {product.description}
                    </p>
                </div>
            )}

            {/* Tags */}
            {product.tags.length > 0 && (
                <div className="mb-6">
                    <h3 className="mb-2 font-semibold text-gray-900">タグ</h3>
                    <div className="flex flex-wrap gap-2">
                        {product.tags.map((tag) => (
                            <Link
                                key={tag.id}
                                href={route('products.index', { tag: tag.slug })}
                                className="rounded-full bg-indigo-100 px-3 py-1 text-sm text-indigo-700 hover:bg-indigo-200"
                            >
                                #{tag.name}
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </>
    );
}


import { Link } from '@inertiajs/react';
import { ProductListItem } from '@/types';

interface ProductResultsProps {
    products: ProductListItem[];
}

export function ProductResults({ products }: ProductResultsProps) {
    if (products.length === 0) return null;

    return (
        <div className="mb-8">
            <h3 className="mb-4 text-lg font-semibold">商品</h3>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </div>
    );
}

function ProductCard({ product }: { product: ProductListItem }) {
    const primaryImage = product.images?.find((img) => img.is_primary) || product.images?.[0];
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
                <h4 className="mb-2 text-lg font-semibold text-gray-900 line-clamp-2">
                    {product.title}
                </h4>
                <span className="text-xl font-bold text-indigo-600">
                    ¥{product.price.toLocaleString()}
                </span>
            </div>
        </Link>
    );
}


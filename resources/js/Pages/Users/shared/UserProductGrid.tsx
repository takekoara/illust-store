import { Link } from '@inertiajs/react';
import { ProductListItem } from '@/types';
import Pagination from '@/Components/Pagination';

interface UserProductGridProps {
    products: ProductListItem[];
    links: any[];
}

export function UserProductGrid({ products, links }: UserProductGridProps) {
    if (products.length === 0) {
        return (
            <div className="overflow-hidden bg-white p-8 text-center shadow-sm sm:rounded-lg">
                <p className="text-gray-500">まだ商品がありません。</p>
            </div>
        );
    }

    return (
        <div>
            <h2 className="mb-4 text-xl font-semibold">商品</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>

            {links && links.length > 3 && (
                <Pagination links={links} className="mt-6" />
            )}
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
                <h3 className="mb-2 text-lg font-semibold text-gray-900 line-clamp-2">
                    {product.title}
                </h3>
                <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-indigo-600">
                        ¥{product.price.toLocaleString()}
                    </span>
                    <div className="flex gap-4 text-sm text-gray-500">
                        <span>👁 {product.views}</span>
                        <span>💰 {product.sales_count}</span>
                    </div>
                </div>
            </div>
        </Link>
    );
}


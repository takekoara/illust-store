import { Link } from '@inertiajs/react';
import { RelatedProduct } from '@/types';

interface RelatedProductsProps {
    products: RelatedProduct[];
}

export function RelatedProducts({ products }: RelatedProductsProps) {
    if (products.length === 0) return null;

    return (
        <div className="mt-12">
            <h2 className="mb-6 text-2xl font-bold text-gray-900">関連商品</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {products.map((related) => {
                    const relatedImage = related.images.find(img => img.is_primary) || related.images[0];
                    const relatedImageUrl = relatedImage
                        ? `/images/${relatedImage.image_path}`
                        : '/placeholder-image.jpg';

                    return (
                        <Link
                            key={related.id}
                            href={route('products.show', related.id)}
                            className="group overflow-hidden rounded-lg bg-white shadow-sm transition-shadow hover:shadow-md"
                        >
                            <div className="aspect-square overflow-hidden bg-gray-100">
                                <img
                                    src={relatedImageUrl}
                                    alt={related.title}
                                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                                />
                            </div>
                            <div className="p-4">
                                <h3 className="mb-2 text-lg font-semibold text-gray-900 line-clamp-2">
                                    {related.title}
                                </h3>
                                <span className="text-xl font-bold text-indigo-600">
                                    ¥{related.price.toLocaleString()}
                                </span>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}


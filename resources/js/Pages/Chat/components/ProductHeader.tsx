import { Link } from '@inertiajs/react';

interface Product {
    id: number;
    title: string;
    price: number;
    images: Array<{
        id: number;
        image_path: string;
        is_primary: boolean;
    }>;
}

interface ProductHeaderProps {
    product: Product;
}

export function ProductHeader({ product }: ProductHeaderProps) {
    const primaryImage = product.images?.find((img) => img.is_primary) || product.images?.[0];
    const imageUrl = primaryImage ? `/images/${primaryImage.image_path}` : '/placeholder-image.jpg';

    return (
        <div className="flex-shrink-0 border-b bg-gray-50 px-4 py-3">
            <div className="mx-auto flex max-w-4xl items-center gap-4">
                <img
                    src={imageUrl}
                    alt={product.title}
                    className="h-16 w-16 rounded-lg object-cover"
                />
                <div className="flex-1">
                    <Link
                        href={route('products.show', product.id)}
                        className="font-semibold text-gray-900 hover:text-indigo-600"
                    >
                        {product.title}
                    </Link>
                    <p className="text-sm text-gray-600">
                        ¥{product.price.toLocaleString()}
                    </p>
                </div>
            </div>
        </div>
    );
}


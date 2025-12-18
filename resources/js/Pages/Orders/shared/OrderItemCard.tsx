import { Link } from '@inertiajs/react';
import { OrderItem } from './types';

interface OrderItemCardProps {
    item: OrderItem;
    size?: 'sm' | 'md';
}

export function OrderItemCard({ item, size = 'md' }: OrderItemCardProps) {
    if (!item.product) {
        return (
            <div className="flex items-center gap-4 rounded-lg border p-4">
                <div className="flex-1">
                    <p className="text-gray-500">商品情報が取得できませんでした</p>
                </div>
                <span className="text-lg font-semibold">
                    ¥{item.price.toLocaleString()}
                </span>
            </div>
        );
    }

    const primaryImage = item.product.images?.find((img) => img.is_primary) || item.product.images?.[0];
    const imageUrl = primaryImage
        ? `/images/${primaryImage.image_path}`
        : '/placeholder-image.jpg';

    const imageSize = size === 'sm' ? 'h-16 w-16' : 'h-20 w-20';
    const padding = size === 'sm' ? 'p-3' : 'p-4';

    return (
        <div className={`flex items-center gap-4 rounded-lg border ${padding}`}>
            <Link href={route('products.show', item.product.id)}>
                <img
                    src={imageUrl}
                    alt={item.product.title}
                    className={`${imageSize} rounded-lg object-cover`}
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
            <span className={size === 'sm' ? 'font-semibold' : 'text-lg font-semibold'}>
                ¥{item.price.toLocaleString()}
            </span>
        </div>
    );
}


import { Link } from '@inertiajs/react';
import DangerButton from '@/Components/DangerButton';

interface CartItem {
    id: number;
    product: {
        id: number;
        title: string;
        price: number;
        images: Array<{
            id: number;
            image_path: string;
            is_primary: boolean;
        }>;
        user: {
            id: number;
            name: string;
            username: string;
        };
    };
}

interface CartItemCardProps {
    item: CartItem;
    onRemove: (id: number) => void;
    processing: boolean;
}

export function CartItemCard({ item, onRemove, processing }: CartItemCardProps) {
    const primaryImage = item.product.images.find((img) => img.is_primary) || item.product.images[0];
    const imageUrl = primaryImage ? `/images/${primaryImage.image_path}` : '/placeholder-image.jpg';

    return (
        <div className="flex gap-4 rounded-lg border p-4">
            <Link href={route('products.show', item.product.id)} className="shrink-0">
                <img
                    src={imageUrl}
                    alt={item.product.title}
                    className="h-24 w-24 rounded-lg object-cover"
                />
            </Link>
            <div className="flex flex-1 flex-col justify-between">
                <div>
                    <Link
                        href={route('products.show', item.product.id)}
                        className="font-semibold text-gray-900 hover:text-indigo-600"
                    >
                        {item.product.title}
                    </Link>
                    <p className="text-sm text-gray-500">
                        {item.product.user.username || item.product.user.name}
                    </p>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-indigo-600">
                        ¥{item.product.price.toLocaleString()}
                    </span>
                    <DangerButton
                        onClick={() => onRemove(item.id)}
                        disabled={processing}
                        className="text-sm"
                    >
                        削除
                    </DangerButton>
                </div>
            </div>
        </div>
    );
}


import { CartItem } from '../shared/types';

interface OrderSummaryProps {
    cartItems: CartItem[];
    total: number;
}

export function OrderSummary({ cartItems, total }: OrderSummaryProps) {
    return (
        <div className="sticky top-4 overflow-hidden bg-white shadow-sm sm:rounded-lg">
            <div className="p-6">
                <h3 className="mb-4 text-lg font-semibold">注文内容</h3>
                <div className="space-y-4">
                    {cartItems.map((item) => (
                        <CartItemRow key={item.id} item={item} />
                    ))}
                </div>
                <div className="mt-4 border-t pt-4">
                    <div className="flex justify-between">
                        <span className="font-semibold">合計</span>
                        <span className="text-lg font-bold text-indigo-600">
                            ¥{total.toLocaleString()}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function CartItemRow({ item }: { item: CartItem }) {
    const primaryImage = item.product.images.find((img) => img.is_primary) || item.product.images[0];
    const imageUrl = primaryImage
        ? `/images/${primaryImage.image_path}`
        : '/placeholder-image.jpg';

    return (
        <div className="flex gap-3">
            <img
                src={imageUrl}
                alt={item.product.title}
                className="h-16 w-16 rounded-lg object-cover"
            />
            <div className="flex-1">
                <p className="text-sm font-medium">{item.product.title}</p>
                <p className="text-sm text-gray-500">
                    ¥{item.product.price.toLocaleString()}
                </p>
            </div>
        </div>
    );
}


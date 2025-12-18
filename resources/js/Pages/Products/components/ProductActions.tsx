import { router } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';

interface ProductActionsProps {
    productId: number;
}

export function ProductActions({ productId }: ProductActionsProps) {
    const handleAddToCart = () => {
        router.post(route('cart.store'), {
            product_id: productId,
        }, {
            preserveScroll: true,
        });
    };

    const handleAskQuestion = () => {
        router.post(route('chat.createFromProduct', productId));
    };

    return (
        <div className="flex flex-col gap-3">
            <PrimaryButton onClick={handleAddToCart} className="flex-1">
                カートに追加
            </PrimaryButton>
            <PrimaryButton
                onClick={handleAskQuestion}
                className="flex-1 bg-gray-600 hover:bg-gray-700"
            >
                この商品について質問する
            </PrimaryButton>
        </div>
    );
}


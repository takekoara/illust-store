import { useForm, router } from '@inertiajs/react';

export function useCart() {
    const { delete: destroy, processing } = useForm({});

    const removeItem = (cartItemId: number) => {
        destroy(route('cart.destroy', cartItemId), {
            preserveScroll: true,
        });
    };

    const clearCart = () => {
        if (confirm('カートを空にしますか？')) {
            router.delete(route('cart.clear'), {
                preserveScroll: true,
            });
        }
    };

    return {
        removeItem,
        clearCart,
        processing,
    };
}


import { useState, useCallback } from 'react';
import { router } from '@inertiajs/react';
import { Product } from '@/types';

interface UseProductActionsReturn {
    processing: boolean;
    toggleActive: (product: Product) => void;
    handleDelete: (productId: number) => void;
}

export function useProductActions(): UseProductActionsReturn {
    const [processing, setProcessing] = useState(false);

    const toggleActive = useCallback((product: Product) => {
        setProcessing(true);
        router.patch(route('products.update', product.id), {
            is_active: !product.is_active,
        }, {
            preserveScroll: true,
            onFinish: () => setProcessing(false),
        });
    }, []);

    const handleDelete = useCallback((productId: number) => {
        if (confirm('本当に削除しますか？')) {
            setProcessing(true);
            router.delete(route('products.destroy', productId), {
                preserveScroll: true,
                onFinish: () => setProcessing(false),
            });
        }
    }, []);

    return {
        processing,
        toggleActive,
        handleDelete,
    };
}


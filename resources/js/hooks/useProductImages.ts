import { useState, useCallback } from 'react';
import { CombinedImage, ProductImage } from '@/types';
import { DragEndEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';

interface CombinedOrderItem {
    type: 'new' | 'existing';
    index: number;
    id?: number;
}

interface UseProductImagesProps {
    initialImages: ProductImage[];
    onUpdate: (data: {
        images?: File[];
        image_order: number[];
        combined_order: CombinedOrderItem[];
    }) => void;
}

export function useProductImages({ initialImages, onUpdate }: UseProductImagesProps) {
    const [combinedImages, setCombinedImages] = useState<CombinedImage[]>(() => {
        return initialImages
            .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
            .map((img) => ({
                id: `existing-${img.id}`,
                type: 'existing' as const,
                existingId: img.id,
                preview: `/images/${img.image_path}`,
            }));
    });

    const updateFormData = useCallback((items: CombinedImage[]) => {
        const newOrder: CombinedOrderItem[] = [];
        const newImageFiles: File[] = [];
        let newImageIndex = 0;

        items.forEach((img, index) => {
            if (img.type === 'new' && img.file) {
                newOrder.push({ type: 'new', index: newImageIndex });
                newImageFiles.push(img.file);
                newImageIndex++;
            } else if (img.type === 'existing' && img.existingId) {
                newOrder.push({ type: 'existing', index: index, id: img.existingId });
            }
        });

        const existingIds = items
            .filter((item) => item.type === 'existing' && item.existingId)
            .map((item) => item.existingId!);

        onUpdate({
            images: newImageFiles.length > 0 ? newImageFiles : undefined,
            image_order: existingIds,
            combined_order: newOrder,
        });
    }, [onUpdate]);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const newImageFiles: CombinedImage[] = acceptedFiles.map((file) => ({
            id: `new-${Math.random().toString(36).substr(2, 9)}`,
            type: 'new' as const,
            file,
            preview: URL.createObjectURL(file),
        }));

        setCombinedImages((prev) => {
            const newCombined = [...prev, ...newImageFiles];
            updateFormData(newCombined);
            return newCombined;
        });
    }, [updateFormData]);

    const removeImage = useCallback((id: string) => {
        setCombinedImages((prev) => {
            const image = prev.find((img) => img.id === id);
            if (image?.type === 'new' && image.preview) {
                URL.revokeObjectURL(image.preview);
            }
            const newItems = prev.filter((img) => img.id !== id);
            updateFormData(newItems);
            return newItems;
        });
    }, [updateFormData]);

    const handleDragEnd = useCallback((event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            setCombinedImages((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);
                const newItems = arrayMove(items, oldIndex, newIndex);
                updateFormData(newItems);
                return newItems;
            });
        }
    }, [updateFormData]);

    return {
        combinedImages,
        onDrop,
        removeImage,
        handleDragEnd,
    };
}


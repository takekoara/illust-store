import { useState, useCallback } from 'react';
import { ImageFile } from '@/types';
import { DragEndEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';

interface UseCreateImagesProps {
    onUpdate: (files: File[]) => void;
}

const MAX_TOTAL_SIZE = 100 * 1024 * 1024; // 100MB

export function useCreateImages({ onUpdate }: UseCreateImagesProps) {
    const [images, setImages] = useState<ImageFile[]>([]);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        // Check total size
        const currentTotalSize = images.reduce((sum, img) => sum + img.file.size, 0);
        const newFilesTotalSize = acceptedFiles.reduce((sum, file) => sum + file.size, 0);

        if (currentTotalSize + newFilesTotalSize > MAX_TOTAL_SIZE) {
            alert(`画像の合計サイズが100MBを超えています。現在の合計: ${(currentTotalSize / 1024 / 1024).toFixed(2)}MB`);
            return;
        }

        const newImages = acceptedFiles.map((file) => ({
            file,
            preview: URL.createObjectURL(file),
            id: Math.random().toString(36).substr(2, 9),
        }));

        setImages((prev) => {
            const updated = [...prev, ...newImages];
            onUpdate(updated.map((img) => img.file));
            return updated;
        });
    }, [images, onUpdate]);

    const removeImage = useCallback((id: string) => {
        setImages((prev) => {
            const image = prev.find((img) => img.id === id);
            if (image) {
                URL.revokeObjectURL(image.preview);
            }
            const newImages = prev.filter((img) => img.id !== id);
            onUpdate(newImages.map((img) => img.file));
            return newImages;
        });
    }, [onUpdate]);

    const handleDragEnd = useCallback((event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            setImages((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);
                const newItems = arrayMove(items, oldIndex, newIndex);
                onUpdate(newItems.map((item) => item.file));
                return newItems;
            });
        }
    }, [onUpdate]);

    const reset = useCallback(() => {
        images.forEach((img) => URL.revokeObjectURL(img.preview));
        setImages([]);
    }, [images]);

    return {
        images,
        onDrop,
        removeImage,
        handleDragEnd,
        reset,
    };
}


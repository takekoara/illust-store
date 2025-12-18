import { useState, useEffect, useRef, useCallback } from 'react';
import { ProductImage } from '@/types';

interface UseImageGalleryProps {
    images: ProductImage[];
}

interface UseImageGalleryReturn {
    selectedImageIndex: number;
    setSelectedImageIndex: (index: number) => void;
    isModalOpen: boolean;
    openModal: () => void;
    closeModal: () => void;
    showThumbnails: boolean;
    modalRef: React.RefObject<HTMLDivElement>;
    selectedImage: ProductImage | undefined;
    imageUrl: string;
    nextImage: () => void;
    prevImage: () => void;
}

export function useImageGallery({ images }: UseImageGalleryProps): UseImageGalleryReturn {
    // 初期表示は primary 画像、なければ最初の画像
    const initialImageIndex = images.findIndex(img => img.is_primary) >= 0
        ? images.findIndex(img => img.is_primary)
        : 0;

    const [selectedImageIndex, setSelectedImageIndex] = useState(initialImageIndex);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showThumbnails, setShowThumbnails] = useState(true);
    
    const modalRef = useRef<HTMLDivElement>(null);
    const wheelTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const mouseMoveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const openModal = useCallback(() => setIsModalOpen(true), []);
    const closeModal = useCallback(() => setIsModalOpen(false), []);

    const nextImage = useCallback(() => {
        setSelectedImageIndex((prev) => {
            if (prev >= images.length - 1) {
                return 0;
            }
            return prev + 1;
        });
    }, [images.length]);

    const prevImage = useCallback(() => {
        setSelectedImageIndex((prev) => {
            if (prev <= 0) {
                return images.length - 1;
            }
            return prev - 1;
        });
    }, [images.length]);

    // マウス移動でサムネイル表示/非表示
    useEffect(() => {
        if (!isModalOpen || images.length <= 1) return;

        const handleMouseMove = () => {
            setShowThumbnails(true);

            if (mouseMoveTimeoutRef.current) {
                clearTimeout(mouseMoveTimeoutRef.current);
            }

            mouseMoveTimeoutRef.current = setTimeout(() => {
                setShowThumbnails(false);
            }, 2000);
        };

        const modalElement = modalRef.current;
        if (modalElement) {
            modalElement.addEventListener('mousemove', handleMouseMove);
        }

        return () => {
            if (modalElement) {
                modalElement.removeEventListener('mousemove', handleMouseMove);
            }
            if (mouseMoveTimeoutRef.current) {
                clearTimeout(mouseMoveTimeoutRef.current);
            }
        };
    }, [isModalOpen, images.length]);

    // ホイールで画像切り替え
    useEffect(() => {
        if (!isModalOpen || images.length <= 1) {
            document.body.style.overflow = '';
            return;
        }

        document.body.style.overflow = 'hidden';

        const handleWheel = (e: WheelEvent) => {
            if (wheelTimeoutRef.current) return;

            e.preventDefault();
            e.stopPropagation();

            wheelTimeoutRef.current = setTimeout(() => {
                wheelTimeoutRef.current = null;
            }, 150);

            if (e.deltaY > 0) {
                nextImage();
            } else if (e.deltaY < 0) {
                prevImage();
            }
        };

        window.addEventListener('wheel', handleWheel, { passive: false });

        return () => {
            document.body.style.overflow = '';
            window.removeEventListener('wheel', handleWheel);
            if (wheelTimeoutRef.current) {
                clearTimeout(wheelTimeoutRef.current);
            }
        };
    }, [isModalOpen, images.length, nextImage, prevImage]);

    const selectedImage = images[selectedImageIndex] || images[0];
    const imageUrl = selectedImage ? `/images/${selectedImage.image_path}` : '/placeholder-image.jpg';

    return {
        selectedImageIndex,
        setSelectedImageIndex,
        isModalOpen,
        openModal,
        closeModal,
        showThumbnails,
        modalRef,
        selectedImage,
        imageUrl,
        nextImage,
        prevImage,
    };
}


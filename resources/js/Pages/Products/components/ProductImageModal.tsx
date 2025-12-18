import Modal from '@/Components/Modal';
import { ProductImage } from '@/types';
import { RefObject } from 'react';

interface ProductImageModalProps {
    isOpen: boolean;
    onClose: () => void;
    images: ProductImage[];
    selectedImageIndex: number;
    onImageSelect: (index: number) => void;
    imageUrl: string;
    productTitle: string;
    showThumbnails: boolean;
    modalRef: RefObject<HTMLDivElement>;
}

export function ProductImageModal({
    isOpen,
    onClose,
    images,
    selectedImageIndex,
    onImageSelect,
    imageUrl,
    productTitle,
    showThumbnails,
    modalRef,
}: ProductImageModalProps) {
    return (
        <Modal
            show={isOpen}
            onClose={onClose}
            maxWidth="7xl"
            closeable={true}
            noScroll={true}
        >
            <div className="p-4 bg-black h-screen flex items-center justify-center" ref={modalRef}>
                <div className="relative w-full h-full flex items-center justify-center max-h-screen">
                    <img
                        src={imageUrl}
                        alt={productTitle}
                        className="max-h-[85vh] max-w-full object-contain cursor-pointer mb-20"
                        onClick={onClose}
                    />
                    {images.length > 1 && (
                        <div
                            className={`absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2 bg-black/70 backdrop-blur-sm rounded-lg px-4 py-2 transition-opacity duration-300 ${
                                showThumbnails ? 'opacity-100' : 'opacity-0 pointer-events-none'
                            }`}
                        >
                            {images.map((image, index) => (
                                <button
                                    key={image.id}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onImageSelect(index);
                                    }}
                                    className={`w-12 h-12 rounded overflow-hidden transition-all ${
                                        index === selectedImageIndex
                                            ? 'ring-2 ring-white scale-110'
                                            : 'opacity-50 hover:opacity-100'
                                    }`}
                                >
                                    <img
                                        src={`/images/${image.image_path}`}
                                        alt={productTitle}
                                        className="h-full w-full object-cover"
                                    />
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
}


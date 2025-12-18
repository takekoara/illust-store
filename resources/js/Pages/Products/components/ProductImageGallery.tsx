import { ProductImage } from '@/types';

interface ProductImageGalleryProps {
    images: ProductImage[];
    selectedImageIndex: number;
    onImageSelect: (index: number) => void;
    onImageClick: () => void;
    imageUrl: string;
    productTitle: string;
}

export function ProductImageGallery({
    images,
    selectedImageIndex,
    onImageSelect,
    onImageClick,
    imageUrl,
    productTitle,
}: ProductImageGalleryProps) {
    return (
        <div>
            <div
                className="mb-4 aspect-square overflow-hidden rounded-lg bg-gray-100 cursor-pointer flex items-center justify-center"
                onClick={onImageClick}
            >
                <img
                    src={imageUrl}
                    alt={productTitle}
                    className="max-h-full max-w-full object-contain"
                />
            </div>
            {images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                    {images.map((image, index) => (
                        <img
                            key={image.id}
                            src={`/images/${image.image_path}`}
                            alt={productTitle}
                            onClick={() => onImageSelect(index)}
                            className={`aspect-square cursor-pointer rounded-lg object-cover transition-all hover:opacity-75 ${
                                index === selectedImageIndex
                                    ? 'ring-2 ring-indigo-500 ring-offset-2'
                                    : ''
                            }`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}


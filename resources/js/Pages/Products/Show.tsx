import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { PageProps, Product, RelatedProduct } from '@/types';
import PrimaryButton from '@/Components/PrimaryButton';
import DangerButton from '@/Components/DangerButton';
import { useCallback } from 'react';

// Custom Hooks
import { useLikeBookmark } from '@/hooks/useLikeBookmark';
import { useImageGallery } from '@/hooks/useImageGallery';

// Components
import {
    ProductImageGallery,
    ProductImageModal,
    LikeBookmarkButtons,
    ProductInfo,
    ProductActions,
    RelatedProducts,
} from './components';

interface Props extends PageProps {
    product: Product;
    relatedProducts: RelatedProduct[];
    isLiked?: boolean;
    isBookmarked?: boolean;
    likeCount?: number;
    bookmarkCount?: number;
}

export default function Show({
    product,
    relatedProducts,
    auth,
    isLiked: initialIsLiked = false,
    isBookmarked: initialIsBookmarked = false,
    likeCount: initialLikeCount = 0,
    bookmarkCount: initialBookmarkCount = 0,
}: Props) {
    const page = usePage();
    const { delete: destroy, processing } = useForm({});

    // CSRF Token Helper
    const getCsrfToken = useCallback((): string => {
        const props = page.props as any;
        if (props.csrfToken) {
            return props.csrfToken;
        }
        const metaToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        return metaToken || '';
    }, [page.props]);

    // Image Gallery Hook
    const {
        selectedImageIndex,
        setSelectedImageIndex,
        isModalOpen,
        openModal,
        closeModal,
        showThumbnails,
        modalRef,
        imageUrl,
    } = useImageGallery({ images: product.images });

    // Like/Bookmark Hook
    const {
        isLiked,
        isBookmarked,
        likeCount,
        bookmarkCount,
        handleLike,
        handleBookmark,
    } = useLikeBookmark({
        productId: product.id,
        initialIsLiked,
        initialIsBookmarked,
        initialLikeCount,
        initialBookmarkCount,
        isAuthenticated: !!auth.user,
        getCsrfToken,
    });

    // Handlers
    const handleDelete = () => {
        if (confirm('本当に削除しますか？')) {
            destroy(route('products.destroy', product.id));
        }
    };

    const isOwner = auth.user && auth.user.id === product.user.id;
    const canInteract = auth.user && !isOwner;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        {product.title}
                    </h2>
                    {isOwner && (
                        <div className="flex gap-2">
                            <Link href={route('products.edit', product.id)}>
                                <PrimaryButton>編集</PrimaryButton>
                            </Link>
                            <DangerButton onClick={handleDelete} disabled={processing}>
                                削除
                            </DangerButton>
                        </div>
                    )}
                </div>
            }
        >
            <Head title={product.title} />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                        {/* Product Images */}
                        <ProductImageGallery
                            images={product.images}
                            selectedImageIndex={selectedImageIndex}
                            onImageSelect={setSelectedImageIndex}
                            onImageClick={openModal}
                            imageUrl={imageUrl}
                            productTitle={product.title}
                        />

                        {/* Product Info */}
                        <div>
                            <ProductInfo product={product} />

                            {/* Like/Bookmark Buttons */}
                            <LikeBookmarkButtons
                                isLiked={isLiked}
                                isBookmarked={isBookmarked}
                                likeCount={likeCount}
                                bookmarkCount={bookmarkCount}
                                onLike={handleLike}
                                onBookmark={handleBookmark}
                                disabled={!auth.user}
                            />

                            {/* Actions (Cart, Chat) */}
                            {canInteract && (
                                <ProductActions productId={product.id} />
                            )}
                        </div>
                    </div>

                    {/* Related Products */}
                    <RelatedProducts products={relatedProducts} />
                </div>
            </div>

            {/* Image Modal */}
            <ProductImageModal
                isOpen={isModalOpen}
                onClose={closeModal}
                images={product.images}
                selectedImageIndex={selectedImageIndex}
                onImageSelect={setSelectedImageIndex}
                imageUrl={imageUrl}
                productTitle={product.title}
                showThumbnails={showThumbnails}
                modalRef={modalRef}
            />
        </AuthenticatedLayout>
    );
}

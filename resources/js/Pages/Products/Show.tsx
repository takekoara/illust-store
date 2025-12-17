import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { PageProps, Product, RelatedProduct } from '@/types';
import PrimaryButton from '@/Components/PrimaryButton';
import DangerButton from '@/Components/DangerButton';
import Modal from '@/Components/Modal';
import { useState, useEffect, useRef } from 'react';

interface Props extends PageProps {
    product: Product;
    relatedProducts: RelatedProduct[];
    isLiked?: boolean;
    isBookmarked?: boolean;
    likeCount?: number;
    bookmarkCount?: number;
}

export default function Show({ product, relatedProducts, auth, isLiked: initialIsLiked = false, isBookmarked: initialIsBookmarked = false, likeCount: initialLikeCount = 0, bookmarkCount: initialBookmarkCount = 0 }: Props) {
    const { delete: destroy, processing } = useForm({});
    
    // 初期表示は primary 画像、なければ最初の画像
    const initialImageIndex = product.images.findIndex(img => img.is_primary) >= 0
        ? product.images.findIndex(img => img.is_primary)
        : 0;
    const [selectedImageIndex, setSelectedImageIndex] = useState(initialImageIndex);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showThumbnails, setShowThumbnails] = useState(true);
    const modalRef = useRef<HTMLDivElement>(null);
    const wheelTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const mouseMoveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    
    // いいね・ブックマークの状態管理
    const [isLiked, setIsLiked] = useState(initialIsLiked);
    const [isBookmarked, setIsBookmarked] = useState(initialIsBookmarked);
    const [likeCount, setLikeCount] = useState(initialLikeCount);
    const [bookmarkCount, setBookmarkCount] = useState(initialBookmarkCount);

    const handleAddToCart = () => {
        router.post(route('cart.store'), {
            product_id: product.id,
        }, {
            preserveScroll: true,
        });
    };

    const handleDelete = () => {
        if (confirm('本当に削除しますか？')) {
            destroy(route('products.destroy', product.id));
        }
    };

    const handleLike = async () => {
        if (!auth.user) {
            router.visit(route('login'));
            return;
        }

        try {
            const response = await fetch(route('likes.toggle', product.id), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            if (response.ok) {
                const data = await response.json();
                setIsLiked(data.is_liked);
                setLikeCount(data.like_count);
            }
        } catch (error) {
            console.error('Error toggling like:', error);
        }
    };

    const handleBookmark = async () => {
        if (!auth.user) {
            router.visit(route('login'));
            return;
        }

        try {
            const response = await fetch(route('bookmarks.toggle', product.id), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            if (response.ok) {
                const data = await response.json();
                setIsBookmarked(data.is_bookmarked);
                setBookmarkCount(data.bookmark_count);
            }
        } catch (error) {
            console.error('Error toggling bookmark:', error);
        }
    };

    const selectedImage = product.images[selectedImageIndex] || product.images[0];
    const imageUrl = selectedImage ? `/images/${selectedImage.image_path}` : '/placeholder-image.jpg';

    // マウス移動でサムネイル表示/非表示
    useEffect(() => {
        if (!isModalOpen || product.images.length <= 1) return;

        const handleMouseMove = () => {
            setShowThumbnails(true);
            
            // マウスが静止しているときは非表示
            if (mouseMoveTimeoutRef.current) {
                clearTimeout(mouseMoveTimeoutRef.current);
            }
            
            mouseMoveTimeoutRef.current = setTimeout(() => {
                setShowThumbnails(false);
            }, 2000); // 2秒静止で非表示
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
    }, [isModalOpen, product.images.length]);

    // ホイールで画像切り替え
    useEffect(() => {
        if (!isModalOpen || product.images.length <= 1) {
            // モーダルが閉じている時はページスクロールを有効化
            document.body.style.overflow = '';
            return;
        }

        // モーダルが開いている時はページスクロールを無効化
        document.body.style.overflow = 'hidden';

        const handleWheel = (e: WheelEvent) => {
            // デバウンス処理（連続スクロールを防ぐ）
            if (wheelTimeoutRef.current) return;
            
            // ページスクロールを防ぐ
            e.preventDefault();
            e.stopPropagation();
            
            wheelTimeoutRef.current = setTimeout(() => {
                wheelTimeoutRef.current = null;
            }, 150);

            // 下にスクロール（次の画像）
            if (e.deltaY > 0) {
                setSelectedImageIndex((prev) => {
                    if (prev >= product.images.length - 1) {
                        return 0; // 最後尾から先頭に
                    }
                    return prev + 1;
                });
            }
            // 上にスクロール（前の画像）
            else if (e.deltaY < 0) {
                setSelectedImageIndex((prev) => {
                    if (prev <= 0) {
                        return product.images.length - 1; // 先頭から最後尾に
                    }
                    return prev - 1;
                });
            }
        };

        // ウィンドウ全体にイベントリスナーを設定（モーダル外でも反応するように）
        window.addEventListener('wheel', handleWheel, { passive: false });

        return () => {
            document.body.style.overflow = '';
            window.removeEventListener('wheel', handleWheel);
            if (wheelTimeoutRef.current) {
                clearTimeout(wheelTimeoutRef.current);
            }
        };
    }, [isModalOpen, product.images.length]);

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        {product.title}
                    </h2>
                    {auth.user && auth.user.id === product.user.id && (
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
                        <div>
                            <div 
                                className="mb-4 aspect-square overflow-hidden rounded-lg bg-gray-100 cursor-pointer flex items-center justify-center"
                                onClick={() => setIsModalOpen(true)}
                            >
                                <img
                                    src={imageUrl}
                                    alt={product.title}
                                    className="max-h-full max-w-full object-contain"
                                />
                            </div>
                            {product.images.length > 1 && (
                                <div className="grid grid-cols-4 gap-2">
                                    {product.images.map((image, index) => (
                                        <img
                                            key={image.id}
                                            src={`/images/${image.image_path}`}
                                            alt={product.title}
                                            onClick={() => setSelectedImageIndex(index)}
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

                        {/* Product Info */}
                        <div>
                            <div className="mb-4 flex items-center gap-3">
                                <img
                                    src={product.user.avatar_type ? `/images/avatars/${product.user.avatar_type}.png` : '/images/avatars/default-avatar.png'}
                                    alt={product.user.name}
                                    className="h-12 w-12 rounded-full"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = '/images/avatars/default-avatar.png';
                                    }}
                                />
                                <div>
                                    <Link
                                        href={`/users/${product.user.id}`}
                                        className="font-semibold text-gray-900 hover:text-indigo-600"
                                    >
                                        {product.user.username || product.user.name}
                                    </Link>
                                    <div className="text-sm text-gray-500">
                                        {product.views} 閲覧 • {product.sales_count} 販売
                                    </div>
                                </div>
                            </div>

                            <h1 className="mb-4 text-3xl font-bold text-gray-900">
                                {product.title}
                            </h1>

                            <div className="mb-6">
                                <span className="text-4xl font-bold text-indigo-600">
                                    ¥{product.price.toLocaleString()}
                                </span>
                            </div>

                            {product.description && (
                                <div className="mb-6">
                                    <h3 className="mb-2 font-semibold text-gray-900">説明</h3>
                                    <p className="whitespace-pre-wrap text-gray-700">
                                        {product.description}
                                    </p>
                                </div>
                            )}

                            {product.tags.length > 0 && (
                                <div className="mb-6">
                                    <h3 className="mb-2 font-semibold text-gray-900">タグ</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {product.tags.map((tag) => (
                                            <Link
                                                key={tag.id}
                                                href={route('products.index', { tag: tag.slug })}
                                                className="rounded-full bg-indigo-100 px-3 py-1 text-sm text-indigo-700 hover:bg-indigo-200"
                                            >
                                                #{tag.name}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* いいね・ブックマークボタン */}
                            <div className="mb-4 flex gap-2">
                                <button
                                    onClick={handleLike}
                                    className={`flex items-center gap-2 rounded-lg px-4 py-2 transition-colors ${
                                        isLiked
                                            ? 'bg-red-100 text-red-600 hover:bg-red-200'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                    disabled={!auth.user}
                                >
                                    <svg
                                        className="h-5 w-5"
                                        fill={isLiked ? 'currentColor' : 'none'}
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                        />
                                    </svg>
                                    <span className="font-medium">{likeCount}</span>
                                </button>
                                <button
                                    onClick={handleBookmark}
                                    className={`flex items-center gap-2 rounded-lg px-4 py-2 transition-colors ${
                                        isBookmarked
                                            ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                    disabled={!auth.user}
                                >
                                    <svg
                                        className="h-5 w-5"
                                        fill={isBookmarked ? 'currentColor' : 'none'}
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                                        />
                                    </svg>
                                    <span className="font-medium">{bookmarkCount}</span>
                                </button>
                            </div>

                            {auth.user && auth.user.id !== product.user.id && (
                                <div className="flex flex-col gap-3">
                                    <PrimaryButton onClick={handleAddToCart} className="flex-1">
                                        カートに追加
                                    </PrimaryButton>
                                    <PrimaryButton
                                        onClick={() => router.post(route('chat.createFromProduct', product.id))}
                                        className="flex-1 bg-gray-600 hover:bg-gray-700"
                                    >
                                        この商品について質問する
                                    </PrimaryButton>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Related Products */}
                    {relatedProducts.length > 0 && (
                        <div className="mt-12">
                            <h2 className="mb-6 text-2xl font-bold text-gray-900">関連商品</h2>
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                                {relatedProducts.map((related) => {
                                    const relatedImage = related.images.find(img => img.is_primary) || related.images[0];
                                    const relatedImageUrl = relatedImage 
                                        ? `/images/${relatedImage.image_path}` 
                                        : '/placeholder-image.jpg';

                                    return (
                                        <Link
                                            key={related.id}
                                            href={route('products.show', related.id)}
                                            className="group overflow-hidden rounded-lg bg-white shadow-sm transition-shadow hover:shadow-md"
                                        >
                                            <div className="aspect-square overflow-hidden bg-gray-100">
                                                <img
                                                    src={relatedImageUrl}
                                                    alt={related.title}
                                                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                                                />
                                            </div>
                                            <div className="p-4">
                                                <h3 className="mb-2 text-lg font-semibold text-gray-900 line-clamp-2">
                                                    {related.title}
                                                </h3>
                                                <span className="text-xl font-bold text-indigo-600">
                                                    ¥{related.price.toLocaleString()}
                                                </span>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Image Modal */}
            <Modal 
                show={isModalOpen} 
                onClose={() => setIsModalOpen(false)}
                maxWidth="7xl"
                closeable={true}
                noScroll={true}
            >
                <div className="p-4 bg-black h-screen flex items-center justify-center" ref={modalRef}>
                    <div className="relative w-full h-full flex items-center justify-center max-h-screen">
                        <img
                            src={imageUrl}
                            alt={product.title}
                            className="max-h-[85vh] max-w-full object-contain cursor-pointer mb-20"
                            onClick={() => setIsModalOpen(false)}
                        />
                        {product.images.length > 1 && (
                            <div 
                                className={`absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2 bg-black/70 backdrop-blur-sm rounded-lg px-4 py-2 transition-opacity duration-300 ${
                                    showThumbnails ? 'opacity-100' : 'opacity-0 pointer-events-none'
                                }`}
                            >
                                {product.images.map((image, index) => (
                                    <button
                                        key={image.id}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedImageIndex(index);
                                        }}
                                        className={`w-12 h-12 rounded overflow-hidden transition-all ${
                                            index === selectedImageIndex
                                                ? 'ring-2 ring-white scale-110'
                                                : 'opacity-50 hover:opacity-100'
                                        }`}
                                    >
                                        <img
                                            src={`/images/${image.image_path}`}
                                            alt={product.title}
                                            className="h-full w-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}


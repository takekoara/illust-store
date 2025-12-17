import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { PageProps, ProductListItem } from '@/types';
import { useState } from 'react';
import PrimaryButton from '@/Components/PrimaryButton';
import DangerButton from '@/Components/DangerButton';

interface User {
    id: number;
    name: string;
    username: string;
    email: string;
    bio: string | null;
    avatar_type: string | null;
    cover_image: string | null;
    website: string | null;
    location: string | null;
    is_verified: boolean;
    products_count: number;
    followers_count: number;
    following_count: number;
}

interface Props extends PageProps {
    user: User;
    products: {
        data: ProductListItem[];
        links: any;
        meta: any;
    };
    isFollowing: boolean;
}

export default function Show({ user, products, isFollowing: initialIsFollowing, auth }: Props) {
    const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
    const [processing, setProcessing] = useState(false);

    const handleFollow = () => {
        if (processing) return;
        
        setProcessing(true);
        router.post(
            route('follow.store'),
            {
                user_id: user.id,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setIsFollowing(true);
                    setProcessing(false);
                },
                onError: (errors) => {
                    console.error('Follow error:', errors);
                    setProcessing(false);
                },
                onFinish: () => {
                    setProcessing(false);
                },
            }
        );
    };

    const handleUnfollow = () => {
        if (processing) return;
        
        setProcessing(true);
        router.delete(
            route('follow.destroy', user.id),
            {
                preserveScroll: true,
                onSuccess: () => {
                    setIsFollowing(false);
                    setProcessing(false);
                },
                onError: (errors) => {
                    console.error('Unfollow error:', errors);
                    setProcessing(false);
                },
                onFinish: () => {
                    setProcessing(false);
                },
            }
        );
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    {user.username || user.name}
                </h2>
            }
        >
            <Head title={`${user.username || user.name}のプロフィール`} />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Profile Header */}
                    <div className="mb-6 overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        {/* Cover Image */}
                        {user.cover_image && (
                            <div className="h-48 w-full overflow-hidden bg-gray-200">
                                <img
                                    src={`/images/${user.cover_image}`}
                                    alt="Cover"
                                    className="h-full w-full object-cover"
                                />
                            </div>
                        )}

                        <div className="p-6">
                            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                                {/* Avatar */}
                                <img
                                    src={
                                        user.avatar_type
                                            ? `/images/avatars/${user.avatar_type}.png`
                                            : '/images/avatars/default-avatar.png'
                                    }
                                    alt={user.name}
                                    className="h-24 w-24 rounded-full border-4 border-white shadow-lg"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = '/images/avatars/default-avatar.png';
                                    }}
                                />

                                {/* User Info */}
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <h1 className="text-2xl font-bold text-gray-900">
                                            {user.username || user.name}
                                        </h1>
                                        {user.is_verified && (
                                            <span className="text-indigo-600">✓</span>
                                        )}
                                    </div>
                                    {user.bio && (
                                        <p className="mt-2 text-gray-600">{user.bio}</p>
                                    )}
                                    <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-500">
                                        {user.location && <span>📍 {user.location}</span>}
                                        {user.website && (
                                            <a
                                                href={user.website}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-indigo-600 hover:text-indigo-800"
                                            >
                                                🌐 {user.website}
                                            </a>
                                        )}
                                    </div>
                                    <div className="mt-4 flex gap-6">
                                        <div>
                                            <span className="font-semibold text-gray-900">
                                                {products.meta?.total ?? user.products_count ?? 0}
                                            </span>
                                            <span className="ml-1 text-gray-500">商品</span>
                                        </div>
                                        <Link
                                            href={route('followers', user.id)}
                                            className="hover:text-indigo-600"
                                        >
                                            <span className="font-semibold text-gray-900">
                                                {user.followers_count}
                                            </span>
                                            <span className="ml-1 text-gray-500">フォロワー</span>
                                        </Link>
                                        <Link
                                            href={route('following', user.id)}
                                            className="hover:text-indigo-600"
                                        >
                                            <span className="font-semibold text-gray-900">
                                                {user.following_count}
                                            </span>
                                            <span className="ml-1 text-gray-500">フォロー中</span>
                                        </Link>
                                    </div>
                                </div>

                                {/* Follow Button */}
                                {auth.user && auth.user.id !== user.id && (
                                    <div>
                                        {isFollowing ? (
                                            <DangerButton
                                                onClick={handleUnfollow}
                                                disabled={processing}
                                            >
                                                フォロー解除
                                            </DangerButton>
                                        ) : (
                                            <PrimaryButton
                                                onClick={handleFollow}
                                                disabled={processing}
                                            >
                                                フォロー
                                            </PrimaryButton>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Products Grid */}
                    {products.data.length === 0 ? (
                        <div className="overflow-hidden bg-white p-8 text-center shadow-sm sm:rounded-lg">
                            <p className="text-gray-500">まだ商品がありません。</p>
                        </div>
                    ) : (
                        <div>
                            <h2 className="mb-4 text-xl font-semibold">商品</h2>
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {products.data.map((product) => {
                                    const primaryImage =
                                        product.images?.find((img) => img.is_primary) ||
                                        product.images?.[0];
                                    const imageUrl = primaryImage
                                        ? `/images/${primaryImage.image_path}`
                                        : '/placeholder-image.jpg';

                                    return (
                                        <Link
                                            key={product.id}
                                            href={route('products.show', product.id)}
                                            className="group overflow-hidden rounded-lg bg-white shadow-sm transition-shadow hover:shadow-md"
                                        >
                                            <div className="aspect-square overflow-hidden bg-gray-100">
                                                <img
                                                    src={imageUrl}
                                                    alt={product.title}
                                                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                                                />
                                            </div>
                                            <div className="p-4">
                                                <h3 className="mb-2 text-lg font-semibold text-gray-900 line-clamp-2">
                                                    {product.title}
                                                </h3>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xl font-bold text-indigo-600">
                                                        ¥{product.price.toLocaleString()}
                                                    </span>
                                                    <div className="flex gap-4 text-sm text-gray-500">
                                                        <span>👁 {product.views}</span>
                                                        <span>💰 {product.sales_count}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>

                            {/* Pagination */}
                            {products.links && products.links.length > 3 && (
                                <div className="mt-6 flex justify-center">
                                    <nav className="flex gap-1">
                                        {products.links.map((link: any, index: number) => (
                                            <Link
                                                key={index}
                                                href={link.url || '#'}
                                                className={`px-4 py-2 rounded-md ${
                                                    link.active
                                                        ? 'bg-indigo-600 text-white'
                                                        : 'bg-white text-gray-700 hover:bg-gray-50'
                                                } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ))}
                                    </nav>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}


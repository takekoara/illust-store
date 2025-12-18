import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { PageProps, ProductListItem } from '@/types';

// Custom Hooks
import { useFollow } from '@/hooks/useFollow';

// Shared Components
import { ProfileHeader, UserProductGrid } from './shared/index';

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
    const { isFollowing, processing, handleFollow, handleUnfollow } = useFollow({
        userId: user.id,
        initialIsFollowing,
    });

    const showFollowButton = !!(auth.user && auth.user.id !== user.id);

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
                    <ProfileHeader
                        user={user}
                        productsTotal={products.meta?.total}
                        isFollowing={isFollowing}
                        processing={processing}
                        showFollowButton={showFollowButton}
                        onFollow={handleFollow}
                        onUnfollow={handleUnfollow}
                    />

                    {/* Products Grid */}
                    <UserProductGrid
                        products={products.data}
                        links={products.links}
                    />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

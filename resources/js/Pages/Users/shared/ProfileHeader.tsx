import { Link } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';
import DangerButton from '@/Components/DangerButton';
import { UserAvatar } from './UserAvatar';

interface User {
    id: number;
    name: string;
    username: string;
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

interface ProfileHeaderProps {
    user: User;
    productsTotal?: number;
    isFollowing: boolean;
    processing: boolean;
    showFollowButton: boolean;
    onFollow: () => void;
    onUnfollow: () => void;
}

export function ProfileHeader({
    user,
    productsTotal,
    isFollowing,
    processing,
    showFollowButton,
    onFollow,
    onUnfollow,
}: ProfileHeaderProps) {
    return (
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
                    <UserAvatar
                        avatarType={user.avatar_type}
                        name={user.name}
                        size="lg"
                    />

                    {/* User Info */}
                    <div className="flex-1">
                        <UserInfo user={user} />
                        <UserStats
                            userId={user.id}
                            productsCount={productsTotal ?? user.products_count ?? 0}
                            followersCount={user.followers_count}
                            followingCount={user.following_count}
                        />
                    </div>

                    {/* Follow Button */}
                    {showFollowButton && (
                        <FollowButton
                            isFollowing={isFollowing}
                            processing={processing}
                            onFollow={onFollow}
                            onUnfollow={onUnfollow}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

// Sub-components
function UserInfo({ user }: { user: User }) {
    return (
        <>
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
        </>
    );
}

interface UserStatsProps {
    userId: number;
    productsCount: number;
    followersCount: number;
    followingCount: number;
}

function UserStats({ userId, productsCount, followersCount, followingCount }: UserStatsProps) {
    return (
        <div className="mt-4 flex gap-6">
            <div>
                <span className="font-semibold text-gray-900">{productsCount}</span>
                <span className="ml-1 text-gray-500">商品</span>
            </div>
            <Link href={route('followers', userId)} className="hover:text-indigo-600">
                <span className="font-semibold text-gray-900">{followersCount}</span>
                <span className="ml-1 text-gray-500">フォロワー</span>
            </Link>
            <Link href={route('following', userId)} className="hover:text-indigo-600">
                <span className="font-semibold text-gray-900">{followingCount}</span>
                <span className="ml-1 text-gray-500">フォロー中</span>
            </Link>
        </div>
    );
}

interface FollowButtonProps {
    isFollowing: boolean;
    processing: boolean;
    onFollow: () => void;
    onUnfollow: () => void;
}

function FollowButton({ isFollowing, processing, onFollow, onUnfollow }: FollowButtonProps) {
    return (
        <div>
            {isFollowing ? (
                <DangerButton onClick={onUnfollow} disabled={processing}>
                    フォロー解除
                </DangerButton>
            ) : (
                <PrimaryButton onClick={onFollow} disabled={processing}>
                    フォロー
                </PrimaryButton>
            )}
        </div>
    );
}


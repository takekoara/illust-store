import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { PageProps } from '@/types';

interface User {
    id: number;
    name: string;
    username: string;
    avatar: string | null;
    avatar_type?: string | null;
    bio: string | null;
}

interface Props extends PageProps {
    user: User;
    followers: {
        data: User[];
        links: any;
        meta: any;
    };
}

export default function Followers({ user, followers, auth }: Props) {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    {user.username || user.name}のフォロワー
                </h2>
            }
        >
            <Head title={`${user.username || user.name}のフォロワー`} />

            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    <div className="mb-4">
                        <Link
                            href={route('users.show', user.id)}
                            className="text-indigo-600 hover:text-indigo-800"
                        >
                            ← プロフィールに戻る
                        </Link>
                    </div>

                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        {followers.data.length === 0 ? (
                            <div className="p-8 text-center">
                                <p className="text-gray-500">フォロワーがいません。</p>
                            </div>
                        ) : (
                            <div className="divide-y">
                                {followers.data.map((follower) => (
                                    <Link
                                        key={follower.id}
                                        href={route('users.show', follower.id)}
                                        className="block p-4 transition-colors hover:bg-gray-50"
                                    >
                                        <div className="flex items-center gap-4">
                                            <img
                                                src={
                                                    follower.avatar_type
                                                        ? `/images/avatars/${follower.avatar_type}.png`
                                                        : '/images/avatars/default-avatar.png'
                                                }
                                                alt={follower.name}
                                                className="h-12 w-12 rounded-full"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = '/images/avatars/default-avatar.png';
                                                }}
                                            />
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-gray-900">
                                                    {follower.username || follower.name}
                                                </h3>
                                                {follower.bio && (
                                                    <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                                                        {follower.bio}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {followers.links && followers.links.length > 3 && (
                            <div className="border-t p-4">
                                <nav className="flex justify-center gap-1">
                                    {followers.links.map((link: any, index: number) => (
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
                </div>
            </div>
        </AuthenticatedLayout>
    );
}


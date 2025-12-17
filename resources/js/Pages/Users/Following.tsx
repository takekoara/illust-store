import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { PageProps } from '@/types';

interface User {
    id: number;
    name: string;
    username: string;
    avatar_type: string | null;
    bio: string | null;
}

interface Props extends PageProps {
    user: User;
    following: {
        data: User[];
        links: any;
        meta: any;
    };
}

export default function Following({ user, following, auth }: Props) {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    {user.username || user.name}がフォロー中
                </h2>
            }
        >
            <Head title={`${user.username || user.name}がフォロー中`} />

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
                        {following.data.length === 0 ? (
                            <div className="p-8 text-center">
                                <p className="text-gray-500">まだ誰もフォローしていません。</p>
                            </div>
                        ) : (
                            <div className="divide-y">
                                {following.data.map((followedUser) => (
                                    <Link
                                        key={followedUser.id}
                                        href={route('users.show', followedUser.id)}
                                        className="block p-4 transition-colors hover:bg-gray-50"
                                    >
                                        <div className="flex items-center gap-4">
                                            <img
                                                src={
                                                    followedUser.avatar_type
                                                        ? `/images/avatars/${followedUser.avatar_type}.png`
                                                        : '/images/avatars/default-avatar.png'
                                                }
                                                alt={followedUser.name}
                                                className="h-12 w-12 rounded-full"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = '/images/avatars/default-avatar.png';
                                                }}
                                            />
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-gray-900">
                                                    {followedUser.username || followedUser.name}
                                                </h3>
                                                {followedUser.bio && (
                                                    <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                                                        {followedUser.bio}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {following.links && following.links.length > 3 && (
                            <div className="border-t p-4">
                                <nav className="flex justify-center gap-1">
                                    {following.links.map((link: any, index: number) => (
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


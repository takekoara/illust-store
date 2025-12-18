import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { PageProps } from '@/types';

// Shared Components
import { BackToProfileLink, UserList } from './shared/index';

interface User {
    id: number;
    name: string;
    username: string;
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

export default function Followers({ user, followers }: Props) {
    const displayName = user.username || user.name;

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    {displayName}のフォロワー
                </h2>
            }
        >
            <Head title={`${displayName}のフォロワー`} />

            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    <BackToProfileLink userId={user.id} />

                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <UserList
                            users={followers.data}
                            links={followers.links}
                            emptyMessage="フォロワーがいません。"
                        />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

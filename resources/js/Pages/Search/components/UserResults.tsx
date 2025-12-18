import { Link } from '@inertiajs/react';
import { UserAvatar } from '@/Pages/Users/shared/index';

interface SearchUser {
    id: number;
    name: string;
    username: string;
    avatar_type?: string | null;
}

interface UserResultsProps {
    users: SearchUser[];
}

export function UserResults({ users }: UserResultsProps) {
    if (users.length === 0) return null;

    return (
        <div className="mb-8">
            <h3 className="mb-4 text-lg font-semibold">ユーザー</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {users.map((user) => (
                    <UserCard key={user.id} user={user} />
                ))}
            </div>
        </div>
    );
}

function UserCard({ user }: { user: SearchUser }) {
    return (
        <Link
            href={route('users.show', user.id)}
            className="flex items-center gap-4 rounded-lg bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
        >
            <UserAvatar
                avatarType={user.avatar_type}
                name={user.name}
                size="md"
            />
            <div>
                <p className="font-semibold text-gray-900">
                    {user.username || user.name}
                </p>
                <p className="text-sm text-gray-500">{user.name}</p>
            </div>
        </Link>
    );
}


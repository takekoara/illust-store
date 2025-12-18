import { Link } from '@inertiajs/react';
import { UserAvatar } from './UserAvatar';

interface User {
    id: number;
    name: string;
    username: string;
    avatar_type?: string | null;
    bio: string | null;
}

interface UserListItemProps {
    user: User;
}

export function UserListItem({ user }: UserListItemProps) {
    return (
        <Link
            href={route('users.show', user.id)}
            className="block p-4 transition-colors hover:bg-gray-50"
        >
            <div className="flex items-center gap-4">
                <UserAvatar
                    avatarType={user.avatar_type}
                    name={user.name}
                    size="md"
                />
                <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                        {user.username || user.name}
                    </h3>
                    {user.bio && (
                        <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                            {user.bio}
                        </p>
                    )}
                </div>
            </div>
        </Link>
    );
}


import { UserListItem } from './UserListItem';
import Pagination from '@/Components/Pagination';

interface User {
    id: number;
    name: string;
    username: string;
    avatar_type?: string | null;
    bio: string | null;
}

interface UserListProps {
    users: User[];
    links: any[];
    emptyMessage: string;
}

export function UserList({ users, links, emptyMessage }: UserListProps) {
    if (users.length === 0) {
        return (
            <div className="p-8 text-center">
                <p className="text-gray-500">{emptyMessage}</p>
            </div>
        );
    }

    return (
        <>
            <div className="divide-y">
                {users.map((user) => (
                    <UserListItem key={user.id} user={user} />
                ))}
            </div>

            {links && links.length > 3 && (
                <div className="border-t p-4">
                    <Pagination links={links} />
                </div>
            )}
        </>
    );
}


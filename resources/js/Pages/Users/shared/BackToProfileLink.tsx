import { Link } from '@inertiajs/react';

interface BackToProfileLinkProps {
    userId: number;
}

export function BackToProfileLink({ userId }: BackToProfileLinkProps) {
    return (
        <div className="mb-4">
            <Link
                href={route('users.show', userId)}
                className="text-indigo-600 hover:text-indigo-800"
            >
                ← プロフィールに戻る
            </Link>
        </div>
    );
}


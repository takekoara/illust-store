import { Link } from '@inertiajs/react';
import { UserAvatar } from '@/Pages/Users/shared/UserAvatar';

interface Conversation {
    id: number;
    type: string;
    other_user: {
        id: number;
        name: string;
        username: string;
        avatar_type?: string | null;
    };
    product?: {
        id: number;
        title: string;
    } | null;
    last_message: {
        message: string;
        created_at: string;
    } | null;
    unread_count: number;
}

interface ConversationItemProps {
    conversation: Conversation;
}

export function ConversationItem({ conversation }: ConversationItemProps) {
    return (
        <Link
            href={route('chat.show', conversation.id)}
            className="block p-4 transition-colors hover:bg-gray-50"
        >
            <div className="flex items-center gap-4">
                <UserAvatar
                    avatarType={conversation.other_user.avatar_type}
                    name={conversation.other_user.name}
                    size="md"
                />
                <div className="flex-1">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-semibold text-gray-900">
                                {conversation.other_user.username || conversation.other_user.name}
                            </h3>
                            {conversation.type === 'product' && conversation.product && (
                                <p className="text-xs text-gray-500">
                                    商品: {conversation.product.title}
                                </p>
                            )}
                        </div>
                        {conversation.unread_count > 0 && (
                            <span className="rounded-full bg-indigo-600 px-2 py-1 text-xs text-white">
                                {conversation.unread_count}
                            </span>
                        )}
                    </div>
                    {conversation.last_message && (
                        <p className="mt-1 truncate text-sm text-gray-500">
                            {conversation.last_message.message}
                        </p>
                    )}
                </div>
            </div>
        </Link>
    );
}


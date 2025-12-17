import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { PageProps } from '@/types';

interface Conversation {
    id: number;
    type: string;
    title?: string | null;
    other_user: {
        id: number;
        name: string;
        username: string;
        avatar: string | null;
        avatar_type?: string | null;
    };
    product?: {
        id: number;
        title: string;
        price: number;
        images: Array<{
            id: number;
            image_path: string;
            is_primary: boolean;
        }>;
    } | null;
    last_message: {
        message: string;
        created_at: string;
    } | null;
    unread_count: number;
}

interface Props extends PageProps {
    conversations: Conversation[];
}

export default function Index({ conversations, auth }: Props) {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    メッセージ
                </h2>
            }
        >
            <Head title="メッセージ" />

            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        {conversations.length === 0 ? (
                            <div className="p-8 text-center">
                                <p className="text-gray-500">メッセージがありません。</p>
                            </div>
                        ) : (
                            <div className="divide-y">
                                {conversations.map((conversation) => (
                                    <Link
                                        key={conversation.id}
                                        href={route('chat.show', conversation.id)}
                                        className="block p-4 transition-colors hover:bg-gray-50"
                                    >
                                        <div className="flex items-center gap-4">
                                            <img
                                                src={
                                                    conversation.other_user.avatar_type
                                                        ? `/images/avatars/${conversation.other_user.avatar_type}.png`
                                                        : '/default-avatar.png'
                                                }
                                                alt={conversation.other_user.name}
                                                className="h-12 w-12 rounded-full"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = '/default-avatar.png';
                                                }}
                                            />
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <h3 className="font-semibold text-gray-900">
                                                            {conversation.other_user.username ||
                                                                conversation.other_user.name}
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
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}


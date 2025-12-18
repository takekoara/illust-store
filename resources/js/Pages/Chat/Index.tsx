import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { PageProps } from '@/types';

// Components
import { ConversationItem, EmptyConversations } from './components/index';

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

interface Props extends PageProps {
    conversations: Conversation[];
}

export default function Index({ conversations }: Props) {
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
                            <EmptyConversations />
                        ) : (
                            <div className="divide-y">
                                {conversations.map((conversation) => (
                                    <ConversationItem
                                        key={conversation.id}
                                        conversation={conversation}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

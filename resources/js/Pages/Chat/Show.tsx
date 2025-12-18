import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { PageProps } from '@/types';

// Custom Hooks
import { useChat } from '@/hooks/useChat';

// Components
import { UserAvatar } from '@/Pages/Users/shared/UserAvatar';
import { MessageBubble, MessageInput, ProductHeader } from './components/index';

interface Message {
    id: number;
    message: string;
    user_id: number;
    created_at: string;
    user: {
        id: number;
        name: string;
        username: string;
        avatar: string | null;
    };
}

interface Conversation {
    id: number;
    type: string;
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
}

interface OtherUser {
    id: number;
    name: string;
    username: string;
    avatar_type?: string | null;
}

interface Props extends PageProps {
    conversation: Conversation;
    otherUser: OtherUser;
    messages: Message[];
}

export default function Show({ conversation, otherUser, messages: initialMessages, auth }: Props) {
    const {
        messages,
        messagesEndRef,
        messageInput,
        setMessageInput,
        sendMessage,
        processing,
    } = useChat({
        conversationId: conversation.id,
        initialMessages,
        currentUserId: auth.user!.id,
        currentUserName: auth.user!.name,
        currentUserUsername: auth.user!.username,
    });

    const showProductHeader = conversation.type === 'product' && conversation.product?.images;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-3">
                    <UserAvatar
                        avatarType={otherUser.avatar_type}
                        name={otherUser.name}
                        size="sm"
                        className="h-8 w-8"
                    />
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        {otherUser.username || otherUser.name}
                    </h2>
                </div>
            }
        >
            <Head title={`${otherUser.username || otherUser.name}とのチャット`} />

            <div className="flex h-[calc(100vh-140px)] flex-col">
                {/* Product Header */}
                {showProductHeader && <ProductHeader product={conversation.product!} />}

                {/* Messages */}
                <div className="flex-1 overflow-y-auto bg-white">
                    <div className="mx-auto w-full max-w-4xl space-y-4 p-4 sm:px-6 lg:px-8">
                        {messages.map((message) => (
                            <MessageBubble
                                key={message.id}
                                message={message}
                                isOwn={message.user_id === auth.user?.id}
                            />
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                </div>

                {/* Input */}
                <MessageInput
                    value={messageInput}
                    onChange={setMessageInput}
                    onSubmit={sendMessage}
                    processing={processing}
                />
            </div>
        </AuthenticatedLayout>
    );
}

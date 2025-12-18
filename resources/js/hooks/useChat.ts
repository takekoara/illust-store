import { useState, useEffect, useRef } from 'react';
import { useForm } from '@inertiajs/react';
import Echo from '@/echo';

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

interface UseChatProps {
    conversationId: number;
    initialMessages: Message[];
    currentUserId: number;
    currentUserName: string;
    currentUserUsername?: string;
}

export function useChat({ conversationId, initialMessages, currentUserId, currentUserName, currentUserUsername }: UseChatProps) {
    const [messages, setMessages] = useState(initialMessages);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const { data, setData, post, processing, reset } = useForm({
        message: '',
    });

    // Scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Update messages when initialMessages change
    useEffect(() => {
        setMessages(initialMessages);
    }, [initialMessages]);

    // Real-time message listening
    useEffect(() => {
        const channel = Echo.private(`conversation.${conversationId}`);

        channel.error((error: any) => {
            console.error('Channel error:', error);
        });

        const handler = (data: any) => {
            const messageData = data.message || data;
            if (!messageData?.id) return;

            setMessages((prev) => {
                if (prev.some((msg) => msg.id === messageData.id)) {
                    return prev;
                }

                const optimisticIndex = prev.findIndex(
                    (msg) =>
                        msg.id > 1000000000000 &&
                        msg.user_id === messageData.user_id &&
                        msg.message === messageData.message
                );

                if (optimisticIndex !== -1) {
                    const newMessages = [...prev];
                    newMessages[optimisticIndex] = messageData;
                    return newMessages.slice(-50);
                }

                return [...prev, messageData].slice(-50);
            });
        };

        channel.listen('.message.sent', handler);

        return () => {
            channel.stopListening('.message.sent');
            Echo.leave(`conversation.${conversationId}`);
        };
    }, [conversationId]);

    const sendMessage = (e: React.FormEvent) => {
        e.preventDefault();

        if (!data.message.trim()) return;

        const messageText = data.message;
        const tempId = Date.now();

        const optimisticMessage: Message = {
            id: tempId,
            user_id: currentUserId,
            message: messageText,
            created_at: new Date().toISOString(),
            user: {
                id: currentUserId,
                name: currentUserName,
                username: currentUserUsername || currentUserName,
                avatar: null,
            },
        };

        setMessages((prev) => [...prev, optimisticMessage].slice(-50));
        reset();

        post(route('chat.message', conversationId), {
            preserveState: true,
            preserveScroll: true,
            onError: () => {
                setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
            },
        });
    };

    return {
        messages,
        messagesEndRef,
        messageInput: data.message,
        setMessageInput: (value: string) => setData('message', value),
        sendMessage,
        processing,
    };
}


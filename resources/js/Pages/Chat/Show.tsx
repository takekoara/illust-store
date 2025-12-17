import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import { useState, useEffect, useRef } from 'react';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
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

interface Conversation {
    id: number;
    user_one_id: number;
    user_two_id: number;
    type: string;
    title?: string | null;
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
    avatar: string | null;
    avatar_type?: string | null;
}

interface Props extends PageProps {
    conversation: Conversation;
    otherUser: OtherUser;
    messages: Message[];
    hasMoreMessages?: boolean;
}

export default function Show({ conversation, otherUser, messages: initialMessages, auth }: Props) {
    const [messages, setMessages] = useState(initialMessages);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const { data, setData, post, processing, reset } = useForm({
        message: '',
    });

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // 初期メッセージが変更されたら更新（ページリロード時など）
    useEffect(() => {
        setMessages(initialMessages);
    }, [initialMessages]);

    // リアルタイムメッセージ受信
    useEffect(() => {
        if (!auth.user) return;

        const channel = Echo.private(`conversation.${conversation.id}`);

        channel.error((error: any) => {
            console.error('Channel error:', error);
        });

        const handler = (data: any) => {
            const messageData = data.message || data;
            if (!messageData?.id) return;
            
            setMessages((prev) => {
                // 重複チェック
                if (prev.some((msg) => msg.id === messageData.id)) {
                    return prev;
                }
                
                // 楽観的メッセージ（一時ID）を実際のメッセージに置き換え
                // 同じユーザーで同じ内容の楽観的メッセージを探す
                const optimisticIndex = prev.findIndex(
                    (msg) => 
                        msg.id > 1000000000000 && // 一時ID（タイムスタンプ）の範囲
                        msg.user_id === messageData.user_id &&
                        msg.message === messageData.message
                );
                
                if (optimisticIndex !== -1) {
                    // 楽観的メッセージを実際のメッセージに置き換え
                    const newMessages = [...prev];
                    newMessages[optimisticIndex] = messageData;
                    return newMessages.slice(-50);
                }
                
                // 新しいメッセージを追加
                const newMessages = [...prev, messageData];
                return newMessages.slice(-50);
            });
        };

        // イベントリスナーは1つだけ
        channel.listen('.message.sent', handler);

        // クリーンアップ
        return () => {
            channel.stopListening('.message.sent');
            Echo.leave(`conversation.${conversation.id}`);
        };
    }, [conversation.id, auth.user]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!data.message.trim()) return;
        
        const messageText = data.message;
        const tempId = Date.now(); // 一時ID
        
        // 楽観的更新：即座にメッセージを追加
        const optimisticMessage: Message = {
            id: tempId,
            user_id: auth.user!.id,
            message: messageText,
            created_at: new Date().toISOString(),
            user: {
                id: auth.user!.id,
                name: auth.user!.name,
                username: auth.user!.username || auth.user!.name,
                avatar: null, // 楽観的更新ではnull（リアルタイム更新で実際の値に置き換わる）
            },
        };
        
        setMessages((prev) => {
            const newMessages = [...prev, optimisticMessage];
            return newMessages.slice(-50);
        });
        
        reset();
        
        // サーバーに送信（preserveState: trueでリロードされない）
        post(route('chat.message', conversation.id), {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                // 成功時はリアルタイム更新で実際のメッセージに置き換わる
            },
            onError: () => {
                // エラー時は楽観的メッセージを削除
                setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
            },
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-3">
                    <img
                        src={
                            otherUser.avatar_type
                                ? `/images/avatars/${otherUser.avatar_type}.png`
                                : '/images/avatars/default-avatar.png'
                        }
                        alt={otherUser.name}
                        className="h-8 w-8 rounded-full"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = '/images/avatars/default-avatar.png';
                        }}
                    />
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        {otherUser.username || otherUser.name}
                    </h2>
                </div>
            }
        >
            <Head title={`${otherUser.username || otherUser.name}とのチャット`} />

            <div className="flex h-[calc(100vh-140px)] flex-col">
                {/* 商品情報表示（商品関連チャットの場合） */}
                {conversation.type === 'product' && conversation.product && conversation.product.images && (
                    <div className="flex-shrink-0 border-b bg-gray-50 px-4 py-3">
                        <div className="mx-auto flex max-w-4xl items-center gap-4">
                            {conversation.product.images && conversation.product.images.length > 0 && (
                                <img
                                    src={`/images/${
                                        conversation.product.images.find((img) => img.is_primary)?.image_path ||
                                        conversation.product.images[0].image_path
                                    }`}
                                    alt={conversation.product.title}
                                    className="h-16 w-16 rounded-lg object-cover"
                                />
                            )}
                            <div className="flex-1">
                                <Link
                                    href={route('products.show', conversation.product.id)}
                                    className="font-semibold text-gray-900 hover:text-indigo-600"
                                >
                                    {conversation.product.title}
                                </Link>
                                <p className="text-sm text-gray-600">
                                    ¥{conversation.product.price.toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* メッセージエリア */}
                <div className="flex-1 overflow-y-auto bg-white">
                    <div className="mx-auto w-full max-w-4xl space-y-4 p-4 sm:px-6 lg:px-8">
                        {messages.map((message) => {
                            const isOwn = message.user_id === auth.user?.id;
                            return (
                                <div
                                    key={message.id}
                                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-xs rounded-lg px-4 py-2 ${
                                            isOwn
                                                ? 'bg-indigo-600 text-white'
                                                : 'bg-gray-100 text-gray-900'
                                        }`}
                                    >
                                        {!isOwn && (
                                            <p className="mb-1 text-xs font-semibold">
                                                {message.user.username || message.user.name}
                                            </p>
                                        )}
                                        <p className="whitespace-pre-wrap">{message.message}</p>
                                        <p
                                            className={`mt-1 text-xs ${
                                                isOwn ? 'text-indigo-100' : 'text-gray-500'
                                            }`}
                                        >
                                            {new Date(message.created_at).toLocaleTimeString('ja-JP', {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>
                </div>

                <div className="flex-shrink-0 border-t bg-white p-4">
                    <form onSubmit={submit} className="mx-auto flex max-w-4xl gap-2">
                        <TextInput
                            value={data.message}
                            onChange={(e) => setData('message', e.target.value)}
                            placeholder="メッセージを入力..."
                            className="flex-1"
                            required
                        />
                        <PrimaryButton type="submit" disabled={processing}>
                            送信
                        </PrimaryButton>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}


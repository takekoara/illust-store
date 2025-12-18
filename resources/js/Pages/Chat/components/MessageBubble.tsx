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

interface MessageBubbleProps {
    message: Message;
    isOwn: boolean;
}

export function MessageBubble({ message, isOwn }: MessageBubbleProps) {
    return (
        <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
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
                <p className={`mt-1 text-xs ${isOwn ? 'text-indigo-100' : 'text-gray-500'}`}>
                    {new Date(message.created_at).toLocaleTimeString('ja-JP', {
                        hour: '2-digit',
                        minute: '2-digit',
                    })}
                </p>
            </div>
        </div>
    );
}


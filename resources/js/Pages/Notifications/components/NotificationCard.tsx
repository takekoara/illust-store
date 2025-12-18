import { Link } from '@inertiajs/react';
import { getNotificationIcon, getNotificationColor } from './notificationHelpers';

interface Notification {
    id: number;
    type: string;
    title: string;
    message: string;
    link: string | null;
    is_read: boolean;
    created_at: string;
}

interface NotificationCardProps {
    notification: Notification;
    onMarkAsRead: (id: number) => void;
    processing: boolean;
}

export function NotificationCard({ notification, onMarkAsRead, processing }: NotificationCardProps) {
    const colorClass = notification.is_read
        ? 'bg-white border-gray-200'
        : getNotificationColor(notification.type);

    return (
        <div className={`p-4 rounded-lg border-2 ${colorClass} transition-all`}>
            <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                    <span className="text-2xl">
                        {getNotificationIcon(notification.type)}
                    </span>
                    <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">
                            {notification.title}
                        </h3>
                        <p className="text-gray-700 mt-1">
                            {notification.message}
                        </p>
                        <p className="text-sm text-gray-500 mt-2">
                            {new Date(notification.created_at).toLocaleString('ja-JP')}
                        </p>
                        {notification.link && (
                            <Link
                                href={notification.link}
                                className="text-blue-600 hover:text-blue-800 text-sm mt-2 inline-block"
                                onClick={() => onMarkAsRead(notification.id)}
                            >
                                詳細を見る →
                            </Link>
                        )}
                    </div>
                </div>
                {!notification.is_read && (
                    <button
                        onClick={() => onMarkAsRead(notification.id)}
                        disabled={processing}
                        className="ml-4 px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50"
                    >
                        既読
                    </button>
                )}
            </div>
        </div>
    );
}


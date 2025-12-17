import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { useState } from 'react';

interface Notification {
    id: number;
    type: string;
    title: string;
    message: string;
    link: string | null;
    is_read: boolean;
    created_at: string;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginationMeta {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface PaginatedNotifications {
    data: Notification[];
    links: PaginationLink[];
    meta: PaginationMeta;
}

interface Props extends PageProps {
    notifications: PaginatedNotifications;
    unreadCount: number;
}

export default function Index({ auth, notifications, unreadCount }: Props) {
    const [processing, setProcessing] = useState(false);

    const markAsRead = (notificationId: number) => {
        if (processing) return;
        setProcessing(true);
        router.post(
            route('notifications.read', notificationId),
            {},
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    // ページをリロードして未読数を更新
                    router.reload({ only: ['unreadCount', 'notifications'] });
                },
                onFinish: () => setProcessing(false),
            }
        );
    };

    const markAllAsRead = () => {
        if (processing) return;
        setProcessing(true);
        router.post(
            route('notifications.read-all'),
            {},
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    // ページをリロードして未読数を更新
                    router.reload({ only: ['unreadCount', 'notifications'] });
                },
                onFinish: () => setProcessing(false),
            }
        );
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'like':
                return '❤️';
            case 'bookmark':
                return '🔖';
            case 'follow':
                return '👤';
            case 'message':
                return '💬';
            default:
                return '🔔';
        }
    };

    const getNotificationColor = (type: string) => {
        switch (type) {
            case 'like':
                return 'bg-red-50 border-red-200';
            case 'bookmark':
                return 'bg-blue-50 border-blue-200';
            case 'follow':
                return 'bg-green-50 border-green-200';
            case 'message':
                return 'bg-purple-50 border-purple-200';
            default:
                return 'bg-gray-50 border-gray-200';
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        通知
                    </h2>
                    {unreadCount > 0 && (
                        <button
                            onClick={markAllAsRead}
                            disabled={processing}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                            すべて既読にする
                        </button>
                    )}
                </div>
            }
        >
            <Head title="通知" />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    {notifications?.data && notifications.data.length > 0 ? (
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6 space-y-4">
                                {notifications.data.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={`p-4 rounded-lg border-2 ${
                                            notification.is_read
                                                ? 'bg-white border-gray-200'
                                                : getNotificationColor(notification.type)
                                        } transition-all`}
                                    >
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
                                                            onClick={() => markAsRead(notification.id)}
                                                        >
                                                            詳細を見る →
                                                        </Link>
                                                    )}
                                                </div>
                                            </div>
                                            {!notification.is_read && (
                                                <button
                                                    onClick={() => markAsRead(notification.id)}
                                                    disabled={processing}
                                                    className="ml-4 px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50"
                                                >
                                                    既読
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            {notifications.links && notifications.links.length > 3 && (
                                <div className="px-6 py-4 border-t border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <div className="text-sm text-gray-700">
                                            {notifications.meta?.total}件中{' '}
                                            {(notifications.meta?.current_page - 1) *
                                                notifications.meta?.per_page +
                                                1}
                                            件目から{' '}
                                            {Math.min(
                                                notifications.meta?.current_page *
                                                    notifications.meta?.per_page,
                                                notifications.meta?.total
                                            )}
                                            件目を表示
                                        </div>
                                        <div className="flex space-x-2">
                                            {notifications.links.map((link, index) => (
                                                <Link
                                                    key={index}
                                                    href={link.url || '#'}
                                                    className={`px-3 py-2 rounded ${
                                                        link.active
                                                            ? 'bg-blue-600 text-white'
                                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                                    } ${!link.url && 'opacity-50 cursor-not-allowed'}`}
                                                    dangerouslySetInnerHTML={{
                                                        __html: link.label,
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-12 text-center">
                                <p className="text-gray-500 text-lg">通知はありません</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}


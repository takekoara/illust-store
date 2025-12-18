import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';

// Custom Hooks
import { useNotifications } from '@/hooks/useNotifications';

// Components
import {
    NotificationCard,
    EmptyNotifications,
    MarkAllReadButton,
    PaginationInfo,
} from './components/index';

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

interface Props extends PageProps {
    notifications: {
        data: Notification[];
        links: PaginationLink[];
        meta: PaginationMeta;
    };
    unreadCount: number;
}

export default function Index({ notifications, unreadCount }: Props) {
    const { processing, markAsRead, markAllAsRead } = useNotifications();

    const hasNotifications = notifications?.data && notifications.data.length > 0;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        通知
                    </h2>
                    {unreadCount > 0 && (
                        <MarkAllReadButton onClick={markAllAsRead} disabled={processing} />
                    )}
                </div>
            }
        >
            <Head title="通知" />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    {hasNotifications ? (
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6 space-y-4">
                                {notifications.data.map((notification) => (
                                    <NotificationCard
                                        key={notification.id}
                                        notification={notification}
                                        onMarkAsRead={markAsRead}
                                        processing={processing}
                                    />
                                ))}
                            </div>

                            <PaginationInfo
                                links={notifications.links}
                                meta={notifications.meta}
                            />
                        </div>
                    ) : (
                        <EmptyNotifications />
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

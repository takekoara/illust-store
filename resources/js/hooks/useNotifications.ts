import { useState } from 'react';
import { router } from '@inertiajs/react';

export function useNotifications() {
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
                    router.reload({ only: ['unreadCount', 'notifications'] });
                },
                onFinish: () => setProcessing(false),
            }
        );
    };

    return {
        processing,
        markAsRead,
        markAllAsRead,
    };
}


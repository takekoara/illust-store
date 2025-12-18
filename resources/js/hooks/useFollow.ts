import { useState } from 'react';
import { router } from '@inertiajs/react';

interface UseFollowProps {
    userId: number;
    initialIsFollowing: boolean;
}

export function useFollow({ userId, initialIsFollowing }: UseFollowProps) {
    const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
    const [processing, setProcessing] = useState(false);

    const handleFollow = () => {
        if (processing) return;

        setProcessing(true);
        router.post(
            route('follow.store'),
            { user_id: userId },
            {
                preserveScroll: true,
                onSuccess: () => setIsFollowing(true),
                onError: (errors) => console.error('Follow error:', errors),
                onFinish: () => setProcessing(false),
            }
        );
    };

    const handleUnfollow = () => {
        if (processing) return;

        setProcessing(true);
        router.delete(route('follow.destroy', userId), {
            preserveScroll: true,
            onSuccess: () => setIsFollowing(false),
            onError: (errors) => console.error('Unfollow error:', errors),
            onFinish: () => setProcessing(false),
        });
    };

    return {
        isFollowing,
        processing,
        handleFollow,
        handleUnfollow,
    };
}


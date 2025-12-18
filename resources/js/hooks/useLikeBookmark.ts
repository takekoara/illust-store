import { useState, useCallback } from 'react';
import { router } from '@inertiajs/react';

interface UseLikeBookmarkProps {
    productId: number;
    initialIsLiked: boolean;
    initialIsBookmarked: boolean;
    initialLikeCount: number;
    initialBookmarkCount: number;
    isAuthenticated: boolean;
    getCsrfToken: () => string;
}

interface UseLikeBookmarkReturn {
    isLiked: boolean;
    isBookmarked: boolean;
    likeCount: number;
    bookmarkCount: number;
    handleLike: () => Promise<void>;
    handleBookmark: () => Promise<void>;
}

export function useLikeBookmark({
    productId,
    initialIsLiked,
    initialIsBookmarked,
    initialLikeCount,
    initialBookmarkCount,
    isAuthenticated,
    getCsrfToken,
}: UseLikeBookmarkProps): UseLikeBookmarkReturn {
    const [isLiked, setIsLiked] = useState(initialIsLiked);
    const [isBookmarked, setIsBookmarked] = useState(initialIsBookmarked);
    const [likeCount, setLikeCount] = useState(initialLikeCount);
    const [bookmarkCount, setBookmarkCount] = useState(initialBookmarkCount);

    const handleLike = useCallback(async () => {
        if (!isAuthenticated) {
            router.visit(route('login'));
            return;
        }

        try {
            const csrfToken = getCsrfToken();
            if (!csrfToken) {
                console.error('CSRF token not available');
                return;
            }

            const response = await fetch(route('likes.toggle', productId), {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': csrfToken,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setIsLiked(data.is_liked);
                setLikeCount(data.like_count);
            }
        } catch (error) {
            console.error('Error toggling like:', error);
        }
    }, [productId, isAuthenticated, getCsrfToken]);

    const handleBookmark = useCallback(async () => {
        if (!isAuthenticated) {
            router.visit(route('login'));
            return;
        }

        try {
            const csrfToken = getCsrfToken();
            if (!csrfToken) {
                console.error('CSRF token not available');
                return;
            }

            const response = await fetch(route('bookmarks.toggle', productId), {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': csrfToken,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setIsBookmarked(data.is_bookmarked);
                setBookmarkCount(data.bookmark_count);
            }
        } catch (error) {
            console.error('Error toggling bookmark:', error);
        }
    }, [productId, isAuthenticated, getCsrfToken]);

    return {
        isLiked,
        isBookmarked,
        likeCount,
        bookmarkCount,
        handleLike,
        handleBookmark,
    };
}


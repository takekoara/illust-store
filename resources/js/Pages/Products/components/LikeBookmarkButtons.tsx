interface LikeBookmarkButtonsProps {
    isLiked: boolean;
    isBookmarked: boolean;
    likeCount: number;
    bookmarkCount: number;
    onLike: () => void;
    onBookmark: () => void;
    disabled: boolean;
}

export function LikeBookmarkButtons({
    isLiked,
    isBookmarked,
    likeCount,
    bookmarkCount,
    onLike,
    onBookmark,
    disabled,
}: LikeBookmarkButtonsProps) {
    return (
        <div className="mb-4 flex gap-2">
            <button
                onClick={onLike}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 transition-colors ${
                    isLiked
                        ? 'bg-red-100 text-red-600 hover:bg-red-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                disabled={disabled}
            >
                <svg
                    className="h-5 w-5"
                    fill={isLiked ? 'currentColor' : 'none'}
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                </svg>
                <span className="font-medium">{likeCount}</span>
            </button>
            <button
                onClick={onBookmark}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 transition-colors ${
                    isBookmarked
                        ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                disabled={disabled}
            >
                <svg
                    className="h-5 w-5"
                    fill={isBookmarked ? 'currentColor' : 'none'}
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                    />
                </svg>
                <span className="font-medium">{bookmarkCount}</span>
            </button>
        </div>
    );
}


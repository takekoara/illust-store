<?php

namespace App\Services;

use App\Models\Bookmark;
use App\Models\Like;
use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Facades\RateLimiter;

class EngagementService
{
    public function __construct(
        private readonly NotificationService $notificationService
    ) {}

    /**
     * Toggle like for a product
     */
    public function toggleLike(Product $product, User $user): array
    {
        $rateLimitResult = $this->checkRateLimit('toggle-like', $user->id, 'いいね');
        if ($rateLimitResult !== null) {
            return $rateLimitResult;
        }

        $like = Like::where('user_id', $user->id)
            ->where('product_id', $product->id)
            ->first();

        if ($like) {
            $like->delete();
            $isLiked = false;
        } else {
            Like::create([
                'user_id' => $user->id,
                'product_id' => $product->id,
            ]);
            $isLiked = true;

            // 通知を送信（いいねした場合のみ）
            $this->notificationService->notifyLike($product, $user);
        }

        return [
            'success' => true,
            'is_liked' => $isLiked,
            'like_count' => $this->getLikeCount($product),
        ];
    }

    /**
     * Toggle bookmark for a product
     */
    public function toggleBookmark(Product $product, User $user): array
    {
        $rateLimitResult = $this->checkRateLimit('toggle-bookmark', $user->id, 'ブックマーク');
        if ($rateLimitResult !== null) {
            return $rateLimitResult;
        }

        $bookmark = Bookmark::where('user_id', $user->id)
            ->where('product_id', $product->id)
            ->first();

        if ($bookmark) {
            $bookmark->delete();
            $isBookmarked = false;
        } else {
            Bookmark::create([
                'user_id' => $user->id,
                'product_id' => $product->id,
            ]);
            $isBookmarked = true;

            // 通知を送信（ブックマークした場合のみ）
            $this->notificationService->notifyBookmark($product, $user);
        }

        return [
            'success' => true,
            'is_bookmarked' => $isBookmarked,
            'bookmark_count' => $this->getBookmarkCount($product),
        ];
    }

    /**
     * Get like status for a product
     */
    public function getLikeStatus(Product $product, ?User $user = null): array
    {
        $isLiked = false;
        if ($user) {
            $isLiked = Like::where('user_id', $user->id)
                ->where('product_id', $product->id)
                ->exists();
        }

        return [
            'is_liked' => $isLiked,
            'like_count' => $this->getLikeCount($product),
        ];
    }

    /**
     * Get bookmark status for a product
     */
    public function getBookmarkStatus(Product $product, ?User $user = null): array
    {
        $isBookmarked = false;
        if ($user) {
            $isBookmarked = Bookmark::where('user_id', $user->id)
                ->where('product_id', $product->id)
                ->exists();
        }

        return [
            'is_bookmarked' => $isBookmarked,
            'bookmark_count' => $this->getBookmarkCount($product),
        ];
    }

    /**
     * Get paginated bookmarks for a user
     */
    public function getUserBookmarks(User $user, int $perPage = 20)
    {
        return Bookmark::where('user_id', $user->id)
            ->with(['product.images', 'product.user', 'product.tags'])
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }

    /**
     * Get like count for a product
     */
    private function getLikeCount(Product $product): int
    {
        return Like::where('product_id', $product->id)->count();
    }

    /**
     * Get bookmark count for a product
     */
    private function getBookmarkCount(Product $product): int
    {
        return Bookmark::where('product_id', $product->id)->count();
    }

    /**
     * Check rate limit
     */
    private function checkRateLimit(string $action, int $userId, string $actionName): ?array
    {
        $key = "{$action}:{$userId}";

        if (RateLimiter::tooManyAttempts($key, 60)) {
            $seconds = RateLimiter::availableIn($key);

            return [
                'success' => false,
                'error' => "{$actionName}の操作が多すぎます。{$seconds}秒後に再度お試しください。",
            ];
        }

        RateLimiter::hit($key, 60);

        return null;
    }
}

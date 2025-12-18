<?php

namespace App\Services;

use App\Models\Follow;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

class FollowService
{
    public function __construct(
        private readonly NotificationService $notificationService
    ) {}

    /**
     * Follow a user
     */
    public function follow(User $follower, User $following): array
    {
        if ($following->id === $follower->id) {
            return [
                'success' => false,
                'message' => '自分自身をフォローすることはできません。',
            ];
        }

        $existingFollow = Follow::where('follower_id', $follower->id)
            ->where('following_id', $following->id)
            ->exists();

        if ($existingFollow) {
            return [
                'success' => false,
                'message' => '既にフォローしています。',
            ];
        }

        Follow::create([
            'follower_id' => $follower->id,
            'following_id' => $following->id,
        ]);

        // 通知を送信
        $this->notificationService->notifyFollow($following, $follower);

        return [
            'success' => true,
            'message' => 'フォローしました。',
        ];
    }

    /**
     * Unfollow a user
     */
    public function unfollow(User $follower, User $following): array
    {
        $deleted = Follow::where('follower_id', $follower->id)
            ->where('following_id', $following->id)
            ->delete();

        return [
            'success' => $deleted > 0,
            'message' => $deleted > 0 ? 'フォローを解除しました。' : 'フォロー関係が見つかりませんでした。',
        ];
    }

    /**
     * Check if user is following another user
     */
    public function isFollowing(User $follower, User $following): bool
    {
        return Follow::where('follower_id', $follower->id)
            ->where('following_id', $following->id)
            ->exists();
    }

    /**
     * Get followers of a user
     */
    public function getFollowers(User $user, int $perPage = 20)
    {
        return $user->followers()->paginate($perPage);
    }

    /**
     * Get users that a user is following
     */
    public function getFollowing(User $user, int $perPage = 20)
    {
        return $user->following()->paginate($perPage);
    }

    /**
     * Get follower count
     */
    public function getFollowerCount(User $user): int
    {
        return Follow::where('following_id', $user->id)->count();
    }

    /**
     * Get following count
     */
    public function getFollowingCount(User $user): int
    {
        return Follow::where('follower_id', $user->id)->count();
    }
}


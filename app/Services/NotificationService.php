<?php

namespace App\Services;

use App\Models\CustomNotification;
use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Facades\Log;

class NotificationService
{
    /**
     * Create a notification
     */
    public function createNotification(User $user, string $type, string $title, string $message, ?string $link = null, ?array $data = null): CustomNotification
    {
        $notification = CustomNotification::create([
            'user_id' => $user->id,
            'type' => $type,
            'title' => $title,
            'message' => $message,
            'link' => $link,
            'data' => $data,
            'is_read' => false,
        ]);

        // Broadcast notification (for real-time updates)
        try {
            broadcast(new \App\Events\NotificationCreated($notification))->toOthers();
        } catch (\Exception $e) {
            Log::error('Failed to broadcast notification: ' . $e->getMessage(), [
                'notification_id' => $notification->id,
            ]);
        }

        return $notification;
    }

    /**
     * Notify user about a new like
     */
    public function notifyLike(Product $product, User $liker): void
    {
        // 自分の商品へのいいねは通知しない
        if ($product->user_id === $liker->id) {
            return;
        }

        $this->createNotification(
            $product->user,
            'like',
            '新しいいいね',
            "{$liker->name}さんがあなたの商品「{$product->title}」にいいねしました",
            route('products.show', $product->id),
            [
                'product_id' => $product->id,
                'liker_id' => $liker->id,
            ]
        );
    }

    /**
     * Notify user about a new follow
     */
    public function notifyFollow(User $followed, User $follower): void
    {
        $this->createNotification(
            $followed,
            'follow',
            '新しいフォロワー',
            "{$follower->name}さんがあなたをフォローしました",
            route('users.show', $follower->id),
            [
                'follower_id' => $follower->id,
            ]
        );
    }

    /**
     * Notify user about a new message
     */
    public function notifyMessage(User $recipient, User $sender, string $messagePreview, int $conversationId): void
    {
        $preview = mb_substr($messagePreview, 0, 50);
        if (mb_strlen($messagePreview) > 50) {
            $preview .= '...';
        }

        $this->createNotification(
            $recipient,
            'message',
            '新しいメッセージ',
            "{$sender->name}さん: {$preview}",
            route('chat.show', $conversationId),
            [
                'sender_id' => $sender->id,
                'conversation_id' => $conversationId,
            ]
        );
    }

    /**
     * Notify user about a new bookmark
     */
    public function notifyBookmark(Product $product, User $bookmarker): void
    {
        // 自分の商品へのブックマークは通知しない
        if ($product->user_id === $bookmarker->id) {
            return;
        }

        $this->createNotification(
            $product->user,
            'bookmark',
            '新しいブックマーク',
            "{$bookmarker->name}さんがあなたの商品「{$product->title}」をブックマークしました",
            route('products.show', $product->id),
            [
                'product_id' => $product->id,
                'bookmarker_id' => $bookmarker->id,
            ]
        );
    }

    /**
     * Mark notification as read
     */
    public function markAsRead(CustomNotification $notification): bool
    {
        return $notification->update(['is_read' => true]);
    }

    /**
     * Mark all notifications as read for a user
     */
    public function markAllAsRead(User $user): int
    {
        return CustomNotification::where('user_id', $user->id)
            ->where('is_read', false)
            ->update(['is_read' => true]);
    }
}


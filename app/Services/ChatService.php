<?php

namespace App\Services;

use App\Events\MessageSent;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;

class ChatService
{
    private const MESSAGES_LIMIT = 50;

    /**
     * Get all conversations for a user with unread counts
     */
    public function getUserConversations(int $userId): Collection
    {
        // 未読数を一括で取得（N+1問題を解決）
        $conversationIds = Conversation::forUser($userId)->pluck('id');
        $unreadCounts = collect();

        if ($conversationIds->isNotEmpty()) {
            $unreadCounts = Message::whereIn('conversation_id', $conversationIds)
                ->where('user_id', '!=', $userId)
                ->where('is_read', false)
                ->selectRaw('conversation_id, COUNT(*) as count')
                ->groupBy('conversation_id')
                ->pluck('count', 'conversation_id');
        }

        return Conversation::forUser($userId)
            ->with([
                'userOne:id,name,username,avatar_type',
                'userTwo:id,name,username,avatar_type',
                'product:id,title,price',
                'messages' => function ($query) {
                    $query->latest()->limit(1)->with('user:id,name,username');
                }
            ])
            ->orderBy('last_message_at', 'desc')
            ->get()
            ->map(function ($conversation) use ($userId, $unreadCounts) {
                $otherUser = $userId === $conversation->user_one_id
                    ? $conversation->userTwo
                    : $conversation->userOne;
                return [
                    'id' => $conversation->id,
                    'type' => $conversation->type,
                    'title' => $conversation->title,
                    'other_user' => $otherUser,
                    'product' => $conversation->product,
                    'last_message' => $conversation->messages->first(),
                    'unread_count' => $unreadCounts->get($conversation->id, 0),
                ];
            });
    }

    /**
     * Get messages for a conversation
     */
    public function getConversationMessages(Conversation $conversation): array
    {
        return Message::where('conversation_id', $conversation->id)
            ->with('user:id,name,username,avatar_type')
            ->orderBy('created_at', 'desc')
            ->limit(self::MESSAGES_LIMIT)
            ->get()
            ->reverse()
            ->values()
            ->all();
    }

    /**
     * Check if conversation has more messages than limit
     */
    public function hasMoreMessages(Conversation $conversation): bool
    {
        return Message::where('conversation_id', $conversation->id)->count() > self::MESSAGES_LIMIT;
    }

    /**
     * Mark messages as read
     */
    public function markMessagesAsRead(Conversation $conversation, int $userId): int
    {
        return Message::where('conversation_id', $conversation->id)
            ->where('user_id', '!=', $userId)
            ->where('is_read', false)
            ->update(['is_read' => true]);
    }

    /**
     * Create or get conversation between two users
     */
    public function getOrCreateDirectConversation(User $currentUser, User $otherUser): Conversation
    {
        $conversation = Conversation::where('type', 'direct')
            ->whereNull('product_id')
            ->betweenUsers($currentUser->id, $otherUser->id)
            ->first();

        if (!$conversation) {
            $conversation = Conversation::create([
                'user_one_id' => $currentUser->id,
                'user_two_id' => $otherUser->id,
                'type' => 'direct',
                'product_id' => null,
            ]);
        }

        return $conversation;
    }

    /**
     * Create or get product-related conversation
     */
    public function getOrCreateProductConversation(Product $product, User $buyer): Conversation
    {
        $seller = $product->user;

        $conversation = Conversation::where('product_id', $product->id)
            ->where('type', 'product')
            ->betweenUsers($buyer->id, $seller->id)
            ->first();

        if (!$conversation) {
            $conversation = Conversation::create([
                'user_one_id' => $buyer->id,
                'user_two_id' => $seller->id,
                'product_id' => $product->id,
                'type' => 'product',
                'title' => $product->title,
            ]);
        }

        return $conversation;
    }

    /**
     * Send a message in a conversation
     */
    public function sendMessage(Conversation $conversation, string $messageText, int $userId): Message
    {
        $message = Message::create([
            'conversation_id' => $conversation->id,
            'user_id' => $userId,
            'message' => $messageText,
        ]);

        $message->load('user:id,name,username,avatar_type');

        // 非同期でブロードキャストと会話更新
        $this->broadcastMessage($message, $conversation);

        return $message;
    }

    /**
     * Broadcast message asynchronously
     */
    private function broadcastMessage(Message $message, Conversation $conversation): void
    {
        $event = new MessageSent($message);

        dispatch(function () use ($event, $conversation) {
            try {
                $conversation->update(['last_message_at' => now()]);
                broadcast($event);
            } catch (\Exception $e) {
                if (config('app.debug')) {
                    Log::error('Broadcast error: ' . $e->getMessage(), [
                        'conversation_id' => $event->message->conversation_id,
                        'message_id' => $event->message->id,
                    ]);
                }
            }
        })->afterResponse();
    }

    /**
     * Check if user can access conversation
     */
    public function canAccessConversation(Conversation $conversation, int $userId): bool
    {
        return $conversation->user_one_id === $userId || $conversation->user_two_id === $userId;
    }
}

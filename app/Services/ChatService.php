<?php

namespace App\Services;

use App\Events\MessageSent;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class ChatService
{
    /**
     * Create or get conversation between two users
     */
    public function getOrCreateDirectConversation(User $user1, User $user2): Conversation
    {
        return Conversation::where('type', 'direct')
            ->whereNull('product_id')
            ->betweenUsers($user1->id, $user2->id)
            ->firstOrCreate([
                'user_one_id' => min($user1->id, $user2->id),
                'user_two_id' => max($user1->id, $user2->id),
                'type' => 'direct',
                'product_id' => null,
            ]);
    }

    /**
     * Create or get product-related conversation
     */
    public function getOrCreateProductConversation(Product $product, User $buyer): Conversation
    {
        $seller = $product->user;

        return Conversation::where('product_id', $product->id)
            ->where('type', 'product')
            ->betweenUsers($buyer->id, $seller->id)
            ->firstOrCreate([
                'user_one_id' => min($buyer->id, $seller->id),
                'user_two_id' => max($buyer->id, $seller->id),
                'product_id' => $product->id,
                'type' => 'product',
                'title' => $product->title,
            ]);
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

        $conversation->update([
            'last_message_at' => now(),
        ]);

        // Load user relationship for broadcast
        $message->load('user');

        // Broadcast message
        try {
            broadcast(new MessageSent($message));
            Log::info('Broadcasting message', [
                'conversation_id' => $conversation->id,
                'message_id' => $message->id,
                'user_id' => $userId,
            ]);
        } catch (\Exception $e) {
            Log::error('Broadcast error: ' . $e->getMessage(), [
                'conversation_id' => $conversation->id,
                'message_id' => $message->id,
            ]);
        }

        return $message;
    }
}


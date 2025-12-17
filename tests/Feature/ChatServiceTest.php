<?php

namespace Tests\Feature;

use App\Models\Conversation;
use App\Models\Message;
use App\Models\Product;
use App\Models\User;
use App\Services\ChatService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ChatServiceTest extends TestCase
{
    use RefreshDatabase;

    protected ChatService $chatService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->chatService = app(ChatService::class);
    }

    public function test_can_create_direct_conversation(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();

        $conversation = $this->chatService->getOrCreateDirectConversation($user1, $user2);

        $this->assertDatabaseHas('conversations', [
            'id' => $conversation->id,
            'type' => 'direct',
            'product_id' => null,
        ]);

        $this->assertEquals(min($user1->id, $user2->id), $conversation->user_one_id);
        $this->assertEquals(max($user1->id, $user2->id), $conversation->user_two_id);
    }

    public function test_reuses_existing_direct_conversation(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();

        $conversation1 = $this->chatService->getOrCreateDirectConversation($user1, $user2);
        $conversation2 = $this->chatService->getOrCreateDirectConversation($user2, $user1);

        $this->assertEquals($conversation1->id, $conversation2->id);
    }

    public function test_can_create_product_conversation(): void
    {
        $seller = User::factory()->create();
        $buyer = User::factory()->create();
        $product = Product::factory()->create(['user_id' => $seller->id]);

        $conversation = $this->chatService->getOrCreateProductConversation($product, $buyer);

        $this->assertDatabaseHas('conversations', [
            'id' => $conversation->id,
            'type' => 'product',
            'product_id' => $product->id,
            'title' => $product->title,
        ]);
    }

    public function test_can_send_message(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();
        $conversation = Conversation::factory()->create([
            'user_one_id' => min($user1->id, $user2->id),
            'user_two_id' => max($user1->id, $user2->id),
            'type' => 'direct',
        ]);

        $message = $this->chatService->sendMessage($conversation, 'Test message', $user1->id);

        $this->assertDatabaseHas('messages', [
            'id' => $message->id,
            'conversation_id' => $conversation->id,
            'user_id' => $user1->id,
            'message' => 'Test message',
        ]);

        $this->assertNotNull($conversation->fresh()->last_message_at);
    }
}


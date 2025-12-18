<?php

namespace Tests\Feature;

use App\Models\Conversation;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\RateLimiter;
use Tests\TestCase;

class ChatControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_send_message(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();
        $conversation = Conversation::factory()->create([
            'user_one_id' => min($user1->id, $user2->id),
            'user_two_id' => max($user1->id, $user2->id),
        ]);

        $response = $this->actingAs($user1)->post(route('chat.message', $conversation), [
            'message' => 'Hello, this is a test message',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('messages', [
            'conversation_id' => $conversation->id,
            'user_id' => $user1->id,
            'message' => 'Hello, this is a test message',
        ]);
    }

    public function test_user_cannot_send_message_to_unauthorized_conversation(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();
        $user3 = User::factory()->create();
        $conversation = Conversation::factory()->create([
            'user_one_id' => min($user1->id, $user2->id),
            'user_two_id' => max($user1->id, $user2->id),
        ]);

        $response = $this->actingAs($user3)->post(route('chat.message', $conversation), [
            'message' => 'Unauthorized message',
        ]);

        $response->assertStatus(403);
    }

    public function test_message_sending_is_rate_limited(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();
        $conversation = Conversation::factory()->create([
            'user_one_id' => min($user1->id, $user2->id),
            'user_two_id' => max($user1->id, $user2->id),
        ]);

        $key = 'send-message:'.$user1->id;

        // レート制限を超えるまでメッセージを送信
        for ($i = 0; $i < 30; $i++) {
            RateLimiter::hit($key, 60);
        }

        $response = $this->actingAs($user1)->post(route('chat.message', $conversation), [
            'message' => 'Rate limited message',
        ]);

        $response->assertSessionHasErrors(['message']);
    }

    public function test_user_can_create_product_chat(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $buyer = User::factory()->create();
        $product = Product::factory()->create(['user_id' => $admin->id]);

        $response = $this->actingAs($buyer)->post(route('chat.createFromProduct', $product));

        $response->assertRedirect();
        $this->assertDatabaseHas('conversations', [
            'product_id' => $product->id,
            'type' => 'product',
        ]);
    }

    public function test_user_cannot_create_chat_for_own_product(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $product = Product::factory()->create(['user_id' => $admin->id]);

        $response = $this->actingAs($admin)->post(route('chat.createFromProduct', $product));

        $response->assertRedirect();
        $response->assertSessionHas('error');
    }

    public function test_existing_conversation_is_reused(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();
        $product = Product::factory()->create(['user_id' => $user2->id]);

        $conversation = Conversation::factory()->productRelated()->create([
            'user_one_id' => min($user1->id, $user2->id),
            'user_two_id' => max($user1->id, $user2->id),
            'product_id' => $product->id,
        ]);

        $response = $this->actingAs($user1)->post(route('chat.createFromProduct', $product));

        $response->assertRedirect(route('chat.show', $conversation));
        $this->assertDatabaseCount('conversations', 1);
    }
}

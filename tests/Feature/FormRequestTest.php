<?php

namespace Tests\Feature;

use App\Http\Requests\MessageStoreRequest;
use App\Http\Requests\ProductStoreRequest;
use App\Models\Conversation;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Validator;
use Tests\TestCase;

class FormRequestTest extends TestCase
{
    use RefreshDatabase;

    public function test_product_store_request_validates_required_fields(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $request = new ProductStoreRequest;

        $validator = Validator::make([], $request->rules());

        $this->assertTrue($validator->fails());
        $this->assertArrayHasKey('title', $validator->errors()->toArray());
        $this->assertArrayHasKey('price', $validator->errors()->toArray());
        $this->assertArrayHasKey('images', $validator->errors()->toArray());
    }

    public function test_product_store_request_authorizes_admin_only(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $user = User::factory()->create(['is_admin' => false]);

        $request = new ProductStoreRequest;
        $request->setUserResolver(fn () => $admin);

        $this->assertTrue($request->authorize());

        $request->setUserResolver(fn () => $user);
        $this->assertFalse($request->authorize());
    }

    public function test_product_update_request_authorizes_owner_only(): void
    {
        $owner = User::factory()->create(['is_admin' => true]);
        $other = User::factory()->create(['is_admin' => true]);
        $product = Product::factory()->create(['user_id' => $owner->id]);

        // 実際のHTTPリクエストでテスト（統合テストとして）
        $response1 = $this->actingAs($owner)->patch(route('products.update', $product), [
            'title' => 'Updated Title',
            'price' => 1000,
        ]);

        // 所有者は更新できる
        $response1->assertRedirect();

        $response2 = $this->actingAs($other)->patch(route('products.update', $product), [
            'title' => 'Hacked Title',
            'price' => 1000,
        ]);

        // 他のユーザーは更新できない
        $response2->assertStatus(403);
    }

    public function test_message_store_request_validates_message_length(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();
        $conversation = Conversation::factory()->create([
            'user_one_id' => min($user1->id, $user2->id),
            'user_two_id' => max($user1->id, $user2->id),
        ]);

        $request = new MessageStoreRequest;
        $request->setRouteResolver(fn () => ['conversation' => $conversation]);
        $request->setUserResolver(fn () => $user1);

        $validator = Validator::make([
            'message' => str_repeat('a', 5001), // 5001文字（制限超過）
        ], $request->rules());

        $this->assertTrue($validator->fails());
        $this->assertArrayHasKey('message', $validator->errors()->toArray());
    }

    public function test_message_store_request_authorizes_conversation_participants(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();
        $user3 = User::factory()->create();
        $conversation = Conversation::factory()->create([
            'user_one_id' => min($user1->id, $user2->id),
            'user_two_id' => max($user1->id, $user2->id),
        ]);

        // 実際のHTTPリクエストでテスト（統合テストとして）
        $response1 = $this->actingAs($user1)->post(route('chat.message', $conversation), [
            'message' => 'Test message from user1',
        ]);

        // 参加者はメッセージを送信できる
        $response1->assertRedirect();

        $response2 = $this->actingAs($user2)->post(route('chat.message', $conversation), [
            'message' => 'Test message from user2',
        ]);

        // 参加者はメッセージを送信できる
        $response2->assertRedirect();

        $response3 = $this->actingAs($user3)->post(route('chat.message', $conversation), [
            'message' => 'Unauthorized message',
        ]);

        // 非参加者はメッセージを送信できない
        $response3->assertStatus(403);
    }
}

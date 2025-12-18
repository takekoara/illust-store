<?php

namespace Tests\Unit;

use App\Models\Bookmark;
use App\Models\CartItem;
use App\Models\Conversation;
use App\Models\CustomNotification;
use App\Models\Like;
use App\Models\Message;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductView;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserModelTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
    }

    public function test_is_admin_returns_false_for_regular_user(): void
    {
        $this->assertFalse($this->user->isAdmin());
    }

    public function test_is_admin_returns_true_for_admin_user(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $this->assertTrue($admin->isAdmin());
    }

    public function test_user_has_many_products(): void
    {
        Product::factory()->count(3)->create(['user_id' => $this->user->id]);

        $this->assertCount(3, $this->user->products);
        $this->assertInstanceOf(Product::class, $this->user->products->first());
    }

    public function test_user_has_many_cart_items(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $product = Product::factory()->create(['user_id' => $admin->id]);
        CartItem::factory()->create(['user_id' => $this->user->id, 'product_id' => $product->id]);

        $this->assertCount(1, $this->user->cartItems);
        $this->assertInstanceOf(CartItem::class, $this->user->cartItems->first());
    }

    public function test_user_has_many_orders(): void
    {
        Order::factory()->count(2)->create(['user_id' => $this->user->id]);

        $this->assertCount(2, $this->user->orders);
        $this->assertInstanceOf(Order::class, $this->user->orders->first());
    }

    public function test_user_has_followers(): void
    {
        $followers = User::factory()->count(3)->create();

        foreach ($followers as $follower) {
            $this->user->followers()->attach($follower->id);
        }

        $this->assertCount(3, $this->user->followers);
    }

    public function test_user_has_following(): void
    {
        $usersToFollow = User::factory()->count(2)->create();

        foreach ($usersToFollow as $userToFollow) {
            $this->user->following()->attach($userToFollow->id);
        }

        $this->assertCount(2, $this->user->following);
    }

    public function test_user_has_conversations_as_user_one(): void
    {
        $otherUser = User::factory()->create();
        Conversation::factory()->create([
            'user_one_id' => $this->user->id,
            'user_two_id' => $otherUser->id,
        ]);

        $this->assertCount(1, $this->user->conversationsAsUserOne);
    }

    public function test_user_has_conversations_as_user_two(): void
    {
        $otherUser = User::factory()->create();
        // Conversationモデルのbootメソッドでuser_one_id < user_two_idに自動調整されるため
        // 直接DBに挿入してbootをバイパス
        \DB::table('conversations')->insert([
            'user_one_id' => $otherUser->id,
            'user_two_id' => $this->user->id,
            'type' => 'direct',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $this->assertCount(1, $this->user->fresh()->conversationsAsUserTwo);
    }

    public function test_user_conversations_returns_all_conversations(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();

        Conversation::factory()->create([
            'user_one_id' => $this->user->id,
            'user_two_id' => $user1->id,
        ]);
        Conversation::factory()->create([
            'user_one_id' => $user2->id,
            'user_two_id' => $this->user->id,
        ]);

        $this->assertCount(2, $this->user->conversations()->get());
    }

    public function test_user_has_many_messages(): void
    {
        $otherUser = User::factory()->create();
        $conversation = Conversation::factory()->create([
            'user_one_id' => $this->user->id,
            'user_two_id' => $otherUser->id,
        ]);
        Message::factory()->count(5)->create([
            'user_id' => $this->user->id,
            'conversation_id' => $conversation->id,
        ]);

        $this->assertCount(5, $this->user->messages);
    }

    public function test_user_has_many_notifications(): void
    {
        CustomNotification::factory()->count(3)->create(['user_id' => $this->user->id]);

        $this->assertCount(3, $this->user->notifications);
    }

    public function test_user_has_many_likes(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $products = Product::factory()->count(2)->create(['user_id' => $admin->id]);

        foreach ($products as $product) {
            Like::factory()->create(['user_id' => $this->user->id, 'product_id' => $product->id]);
        }

        $this->assertCount(2, $this->user->likes);
    }

    public function test_user_has_many_bookmarks(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $products = Product::factory()->count(2)->create(['user_id' => $admin->id]);

        foreach ($products as $product) {
            Bookmark::factory()->create(['user_id' => $this->user->id, 'product_id' => $product->id]);
        }

        $this->assertCount(2, $this->user->bookmarks);
    }

    public function test_user_has_many_product_views(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $product = Product::factory()->create(['user_id' => $admin->id]);
        ProductView::factory()->create(['user_id' => $this->user->id, 'product_id' => $product->id]);

        $this->assertCount(1, $this->user->productViews);
    }

    public function test_user_password_is_hidden(): void
    {
        $array = $this->user->toArray();
        $this->assertArrayNotHasKey('password', $array);
    }

    public function test_user_remember_token_is_hidden(): void
    {
        $array = $this->user->toArray();
        $this->assertArrayNotHasKey('remember_token', $array);
    }

    public function test_user_is_verified_is_cast_to_boolean(): void
    {
        $user = User::factory()->create(['is_verified' => 1]);
        $this->assertIsBool($user->is_verified);
    }

    public function test_user_is_admin_is_cast_to_boolean(): void
    {
        $user = User::factory()->create(['is_admin' => 1]);
        $this->assertIsBool($user->is_admin);
    }
}

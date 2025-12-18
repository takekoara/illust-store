<?php

namespace Tests\Feature;

use App\Models\Like;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\RateLimiter;
use Tests\TestCase;

class LikeControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_like_product(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->create();

        $response = $this->actingAs($user)->post(route('likes.toggle', $product));

        $response->assertOk();
        $response->assertJson([
            'is_liked' => true,
        ]);
        $this->assertDatabaseHas('likes', [
            'user_id' => $user->id,
            'product_id' => $product->id,
        ]);
    }

    public function test_user_can_unlike_product(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->create();
        Like::factory()->create([
            'user_id' => $user->id,
            'product_id' => $product->id,
        ]);

        $response = $this->actingAs($user)->post(route('likes.toggle', $product));

        $response->assertOk();
        $response->assertJson([
            'is_liked' => false,
        ]);
        $this->assertDatabaseMissing('likes', [
            'user_id' => $user->id,
            'product_id' => $product->id,
        ]);
    }

    public function test_like_toggle_is_rate_limited(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->create();

        $key = 'toggle-like:'.$user->id;

        // レート制限を超えるまでいいねを実行
        for ($i = 0; $i < 60; $i++) {
            RateLimiter::hit($key, 60);
        }

        $response = $this->actingAs($user)->post(route('likes.toggle', $product));

        $response->assertStatus(429);
        $response->assertJsonStructure(['error']);
    }

    public function test_guest_cannot_like_product(): void
    {
        $product = Product::factory()->create();

        $response = $this->post(route('likes.toggle', $product));

        // ゲストはログインページにリダイレクトされるか、エラーメッセージが返される
        $this->assertTrue(
            $response->isRedirect() ||
            $response->status() === 401 ||
            $response->status() === 403
        );
    }

    public function test_like_count_is_returned(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->create();
        Like::factory()->count(5)->create(['product_id' => $product->id]);

        $response = $this->actingAs($user)->get(route('likes.status', $product));

        $response->assertOk();
        $response->assertJson([
            'like_count' => 5,
        ]);
    }
}

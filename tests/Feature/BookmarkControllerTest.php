<?php

namespace Tests\Feature;

use App\Models\Bookmark;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\RateLimiter;
use Tests\TestCase;

class BookmarkControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_bookmark_product(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->create();

        $response = $this->actingAs($user)->post(route('bookmarks.toggle', $product));

        $response->assertOk();
        $response->assertJson([
            'is_bookmarked' => true,
        ]);
        $this->assertDatabaseHas('bookmarks', [
            'user_id' => $user->id,
            'product_id' => $product->id,
        ]);
    }

    public function test_user_can_unbookmark_product(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->create();
        Bookmark::factory()->create([
            'user_id' => $user->id,
            'product_id' => $product->id,
        ]);

        $response = $this->actingAs($user)->post(route('bookmarks.toggle', $product));

        $response->assertOk();
        $response->assertJson([
            'is_bookmarked' => false,
        ]);
        $this->assertDatabaseMissing('bookmarks', [
            'user_id' => $user->id,
            'product_id' => $product->id,
        ]);
    }

    public function test_bookmark_toggle_is_rate_limited(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->create();

        $key = 'toggle-bookmark:' . $user->id;
        
        // レート制限を超えるまでブックマークを実行
        for ($i = 0; $i < 60; $i++) {
            RateLimiter::hit($key, 60);
        }

        $response = $this->actingAs($user)->post(route('bookmarks.toggle', $product));

        $response->assertStatus(429);
        $response->assertJsonStructure(['error']);
    }

    public function test_guest_cannot_bookmark_product(): void
    {
        $product = Product::factory()->create();

        $response = $this->post(route('bookmarks.toggle', $product));

        // ゲストはログインページにリダイレクトされるか、エラーメッセージが返される
        $this->assertTrue(
            $response->isRedirect() || 
            $response->status() === 401 || 
            $response->status() === 403
        );
    }

    public function test_user_can_view_bookmarks(): void
    {
        $user = User::factory()->create();
        $products = Product::factory()->count(3)->create();
        
        foreach ($products as $product) {
            Bookmark::factory()->create([
                'user_id' => $user->id,
                'product_id' => $product->id,
            ]);
        }

        $response = $this->actingAs($user)->get(route('bookmarks.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Bookmarks/Index')
            ->has('bookmarks.data', 3)
        );
    }

    public function test_bookmark_count_is_returned(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->create();
        Bookmark::factory()->count(3)->create(['product_id' => $product->id]);

        $response = $this->actingAs($user)->get(route('bookmarks.status', $product));

        $response->assertOk();
        $response->assertJson([
            'bookmark_count' => 3,
        ]);
    }
}


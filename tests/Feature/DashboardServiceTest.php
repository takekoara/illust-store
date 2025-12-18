<?php

namespace Tests\Feature;

use App\Models\Bookmark;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use App\Services\DashboardService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class DashboardServiceTest extends TestCase
{
    use RefreshDatabase;

    private DashboardService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = app(DashboardService::class);
    }

    public function test_get_admin_stats_returns_correct_structure(): void
    {
        // Arrange
        $admin = User::factory()->create(['is_admin' => true]);
        User::factory()->count(3)->create();
        Product::factory()->count(5)->create(['user_id' => $admin->id, 'is_active' => true]);
        Product::factory()->count(2)->create(['user_id' => $admin->id, 'is_active' => false]);

        // Act
        $stats = $this->service->getAdminStats();

        // Assert
        $this->assertArrayHasKey('total_products', $stats);
        $this->assertArrayHasKey('active_products', $stats);
        $this->assertArrayHasKey('total_users', $stats);
        $this->assertArrayHasKey('total_orders', $stats);
        $this->assertArrayHasKey('total_revenue', $stats);
        $this->assertArrayHasKey('pending_orders', $stats);
        $this->assertArrayHasKey('recent_orders', $stats);
        $this->assertArrayHasKey('recent_products', $stats);

        $this->assertEquals(7, $stats['total_products']);
        $this->assertEquals(5, $stats['active_products']);
        $this->assertEquals(4, $stats['total_users']); // admin + 3 users
    }

    public function test_get_admin_stats_calculates_revenue_correctly(): void
    {
        // Arrange
        $user = User::factory()->create();
        Order::factory()->create(['user_id' => $user->id, 'status' => 'completed', 'total_amount' => 1000]);
        Order::factory()->create(['user_id' => $user->id, 'status' => 'completed', 'total_amount' => 2500]);
        Order::factory()->create(['user_id' => $user->id, 'status' => 'pending', 'total_amount' => 500]);

        Cache::forget('dashboard.stats.admin');

        // Act
        $stats = $this->service->getAdminStats();

        // Assert
        $this->assertEquals(3500, $stats['total_revenue']);
        $this->assertEquals(1, $stats['pending_orders']);
    }

    public function test_get_admin_stats_caches_results(): void
    {
        // Arrange
        Cache::forget('dashboard.stats.admin');

        // Act
        $stats1 = $this->service->getAdminStats();

        // Create more data after first call
        User::factory()->count(5)->create();

        $stats2 = $this->service->getAdminStats();

        // Assert - cached values should be the same
        $this->assertEquals($stats1['total_users'], $stats2['total_users']);
    }

    public function test_clear_admin_stats_cache(): void
    {
        // Arrange
        Cache::put('dashboard.stats.admin', ['test' => 'data'], 300);

        // Act
        $this->service->clearAdminStatsCache();

        // Assert
        $this->assertNull(Cache::get('dashboard.stats.admin'));
    }

    public function test_get_user_stats_returns_correct_structure(): void
    {
        // Arrange
        $user = User::factory()->create();
        $admin = User::factory()->create(['is_admin' => true]);

        Product::factory()->count(3)->create(['user_id' => $user->id, 'is_active' => true]);
        Product::factory()->count(1)->create(['user_id' => $user->id, 'is_active' => false]);
        Order::factory()->count(2)->create(['user_id' => $user->id]);

        // Act
        $stats = $this->service->getUserStats($user);

        // Assert
        $this->assertArrayHasKey('my_products', $stats);
        $this->assertArrayHasKey('my_active_products', $stats);
        $this->assertArrayHasKey('my_orders', $stats);
        $this->assertArrayHasKey('my_cart_items', $stats);
        $this->assertArrayHasKey('my_followers', $stats);
        $this->assertArrayHasKey('my_following', $stats);
        $this->assertArrayHasKey('my_bookmarks_count', $stats);
        $this->assertArrayHasKey('recent_orders', $stats);

        $this->assertEquals(4, $stats['my_products']);
        $this->assertEquals(3, $stats['my_active_products']);
        $this->assertEquals(2, $stats['my_orders']);
    }

    public function test_get_user_stats_counts_followers_correctly(): void
    {
        // Arrange
        $user = User::factory()->create();
        $followers = User::factory()->count(3)->create();

        foreach ($followers as $follower) {
            $user->followers()->attach($follower->id);
        }

        // Act
        $stats = $this->service->getUserStats($user);

        // Assert
        $this->assertEquals(3, $stats['my_followers']);
    }

    public function test_get_user_bookmarks_returns_products(): void
    {
        // Arrange
        $user = User::factory()->create();
        $admin = User::factory()->create(['is_admin' => true]);
        $products = Product::factory()->count(3)->create(['user_id' => $admin->id]);

        foreach ($products as $product) {
            Bookmark::factory()->create([
                'user_id' => $user->id,
                'product_id' => $product->id,
            ]);
        }

        // Act
        $bookmarks = $this->service->getUserBookmarks($user);

        // Assert
        $this->assertCount(3, $bookmarks);
    }

    public function test_get_user_bookmarks_excludes_deleted_products(): void
    {
        // Arrange
        $user = User::factory()->create();
        $admin = User::factory()->create(['is_admin' => true]);

        $product1 = Product::factory()->create(['user_id' => $admin->id]);
        $product2 = Product::factory()->create(['user_id' => $admin->id]);

        Bookmark::factory()->create(['user_id' => $user->id, 'product_id' => $product1->id]);
        Bookmark::factory()->create(['user_id' => $user->id, 'product_id' => $product2->id]);

        // Soft delete one product
        $product1->delete();

        // Act
        $bookmarks = $this->service->getUserBookmarks($user);

        // Assert
        $this->assertCount(1, $bookmarks);
    }

    public function test_get_user_bookmarks_respects_limit(): void
    {
        // Arrange
        $user = User::factory()->create();
        $admin = User::factory()->create(['is_admin' => true]);
        $products = Product::factory()->count(10)->create(['user_id' => $admin->id]);

        foreach ($products as $product) {
            Bookmark::factory()->create([
                'user_id' => $user->id,
                'product_id' => $product->id,
            ]);
        }

        // Act
        $bookmarks = $this->service->getUserBookmarks($user, 5);

        // Assert
        $this->assertCount(5, $bookmarks);
    }

    public function test_recent_orders_eager_loads_relationships(): void
    {
        // Arrange
        $user = User::factory()->create();
        $admin = User::factory()->create(['is_admin' => true]);
        $product = Product::factory()->create(['user_id' => $admin->id]);

        $order = Order::factory()->create(['user_id' => $user->id]);
        $order->items()->create([
            'product_id' => $product->id,
            'quantity' => 1,
            'price' => $product->price,
        ]);

        Cache::forget('dashboard.stats.admin');

        // Act
        $stats = $this->service->getAdminStats();

        // Assert - Check that relationships are loaded (no additional queries)
        $this->assertTrue($stats['recent_orders']->first()->relationLoaded('user'));
        $this->assertTrue($stats['recent_orders']->first()->relationLoaded('items'));
    }
}

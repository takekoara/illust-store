<?php

namespace Tests\Feature;

use App\Models\CartItem;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use App\Services\OrderService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;
use Tests\TestCase;

class OrderServiceTest extends TestCase
{
    use RefreshDatabase;

    protected OrderService $orderService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->orderService = app(OrderService::class);
    }

    public function test_can_create_order_from_cart(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->create(['price' => 1000, 'is_active' => true]);

        CartItem::factory()->create([
            'user_id' => $user->id,
            'product_id' => $product->id,
        ]);

        Auth::login($user);

        $order = $this->orderService->createOrderFromCart([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'address' => 'Test Address',
        ]);

        $this->assertDatabaseHas('orders', [
            'id' => $order->id,
            'user_id' => $user->id,
            'total_amount' => 1000,
            'status' => 'pending',
        ]);

        $this->assertCount(1, $order->items);
        $this->assertDatabaseMissing('cart_items', ['user_id' => $user->id]);
    }

    public function test_cannot_create_order_with_empty_cart(): void
    {
        $user = User::factory()->create();
        Auth::login($user);

        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('カートが空です。');

        $this->orderService->createOrderFromCart([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);
    }

    public function test_cannot_create_order_with_inactive_product(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->create(['is_active' => false]);

        CartItem::factory()->create([
            'user_id' => $user->id,
            'product_id' => $product->id,
        ]);

        Auth::login($user);

        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('カートに無効な商品が含まれています。');

        $this->orderService->createOrderFromCart([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);
    }

    public function test_can_complete_order(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->create(['sales_count' => 0]);
        $order = Order::factory()->create([
            'user_id' => $user->id,
            'status' => 'pending',
        ]);
        $order->items()->create([
            'product_id' => $product->id,
            'price' => 1000,
        ]);

        $result = $this->orderService->completeOrder($order);

        $this->assertTrue($result);
        $this->assertEquals('completed', $order->fresh()->status);
        $this->assertEquals(1, $product->fresh()->sales_count);
    }

    public function test_cannot_complete_non_pending_order(): void
    {
        $order = Order::factory()->create(['status' => 'completed']);

        $result = $this->orderService->completeOrder($order);

        $this->assertFalse($result);
        // 状態が変更されていないことを確認
        $this->assertEquals('completed', $order->fresh()->status);
    }

    /**
     * 異常系: pendingで正常に動作するか（trueが返るか）
     * 注文の状態がcompletedになること
     * 商品の売上数が増加すること
     */
    public function test_complete_order_updates_status_and_sales_count(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->create(['sales_count' => 5]);
        $order = Order::factory()->create([
            'user_id' => $user->id,
            'status' => 'pending',
        ]);
        $order->items()->create([
            'product_id' => $product->id,
            'price' => 1000,
        ]);

        $result = $this->orderService->completeOrder($order);

        $this->assertTrue($result);
        $this->assertEquals('completed', $order->fresh()->status);
        $this->assertEquals(6, $product->fresh()->sales_count); // 5 + 1
    }
}

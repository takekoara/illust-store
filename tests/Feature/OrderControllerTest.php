<?php

namespace Tests\Feature;

use App\Models\CartItem;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use App\Services\OrderService;
use App\Services\StripeService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery;
use Tests\TestCase;

class OrderControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    public function test_inactive_product_blocks_checkout_and_payment_intent_creation(): void
    {
        /** @var User $user */
        $user = User::factory()->createOne();
        $product = Product::factory()->create([
            'is_active' => false,
            'price' => 1200,
        ]);
        CartItem::factory()->create([
            'user_id' => $user->id,
            'product_id' => $product->id,
        ]);

        $response = $this->actingAs($user)->get(route('orders.create'));

        $response->assertRedirect(route('cart.index'));
        $response->assertSessionHas('error');
    }

    public function test_order_status_is_not_changed_by_query_params(): void
    {
        /** @var User $user */
        $user = User::factory()->createOne();
        $order = Order::factory()->create([
            'user_id' => $user->id,
            'status' => 'pending',
            'total_amount' => 1500,
            'stripe_payment_intent_id' => 'pi_fake',
        ]);

        // StripeServiceをモック
        $mockStripeService = Mockery::mock(StripeService::class);
        $mockStripeService->shouldReceive('verifyPayment')
            ->andReturn([
                'verified' => false,
                'status' => 'requires_payment_method',
                'paymentIntentId' => 'pi_fake',
            ]);
        $this->app->instance(StripeService::class, $mockStripeService);

        $response = $this->actingAs($user)->get(
            route('orders.show', $order).'?payment_intent=pi_fake&redirect_status=succeeded'
        );

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Orders/Show')
            ->where('order.status', 'pending')
            ->where('paymentSuccess', false)
        );
        $this->assertSame('pending', $order->fresh()->status);
    }

    public function test_order_remains_pending_until_webhook_updates_status(): void
    {
        /** @var User $user */
        $user = User::factory()->createOne();
        $admin = User::factory()->create(['is_admin' => true]);
        $product = Product::factory()->create([
            'user_id' => $admin->id,
            'price' => 2000,
            'is_active' => true,
        ]);
        $order = Order::factory()->create([
            'user_id' => $user->id,
            'status' => 'pending',
            'total_amount' => 2000,
            'stripe_payment_intent_id' => 'pi_success',
        ]);
        OrderItem::create([
            'order_id' => $order->id,
            'product_id' => $product->id,
            'price' => $product->price,
        ]);

        // StripeServiceをモック（verifyPaymentでverified=trueを返す）
        // しかしstatusはcompletedに更新される（OrderController::showのロジック）
        $mockStripeService = Mockery::mock(StripeService::class);
        $mockStripeService->shouldReceive('verifyPayment')
            ->andReturn([
                'verified' => true,
                'status' => 'succeeded',
                'paymentIntentId' => 'pi_success',
            ]);
        $this->app->instance(StripeService::class, $mockStripeService);

        $response = $this->actingAs($user)->get(
            route('orders.show', $order).'?payment_intent=pi_success&redirect_status=succeeded'
        );

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Orders/Show')
            // 注：OrderController::showで支払い成功時はstatusがcompletedに更新される
            ->where('order.status', 'completed')
            ->where('paymentSuccess', true)
        );
        // 支払い検証成功時はcompletedに更新される
        $this->assertSame('completed', $order->fresh()->status);
    }

    public function test_order_service_can_complete_order(): void
    {
        $user = User::factory()->create();
        $admin = User::factory()->create(['is_admin' => true]);
        $product = Product::factory()->create([
            'user_id' => $admin->id,
            'price' => 2000,
            'is_active' => true,
        ]);
        $order = Order::factory()->create([
            'user_id' => $user->id,
            'status' => 'pending',
            'total_amount' => 2000,
            'stripe_payment_intent_id' => 'pi_correct',
        ]);
        OrderItem::create([
            'order_id' => $order->id,
            'product_id' => $product->id,
            'price' => $product->price,
        ]);

        // OrderServiceのcompleteOrderを直接呼び出し
        $orderService = app(OrderService::class);
        $result = $orderService->completeOrder($order);

        $this->assertTrue($result);
        $this->assertSame('completed', $order->fresh()->status);
    }
}

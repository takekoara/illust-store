<?php

namespace Tests\Feature;

use App\Jobs\ProcessPaymentSuccess;
use App\Models\CartItem;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use App\Services\OrderService;
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

        $paymentIntent = (object) [
            'id' => 'pi_fake',
            'status' => 'requires_payment_method',
            'amount_received' => 0,
            'metadata' => (object) ['order_id' => (string) $order->id],
        ];

        Mockery::mock('alias:Stripe\PaymentIntent')
            ->shouldReceive('retrieve')
            ->once()
            ->with('pi_fake')
            ->andReturn($paymentIntent);

        $response = $this->actingAs($user)->get(
            route('orders.show', $order) . '?payment_intent=pi_fake&redirect_status=succeeded'
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
        $product = Product::factory()->create(['price' => 2000, 'is_active' => true]);
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

        $paymentIntent = (object) [
            'id' => 'pi_success',
            'status' => 'succeeded',
            'amount_received' => (int) ($order->total_amount * 100),
            'metadata' => (object) ['order_id' => (string) $order->id],
        ];

        Mockery::mock('alias:Stripe\PaymentIntent')
            ->shouldReceive('retrieve')
            ->atLeast()->once()
            ->with('pi_success')
            ->andReturn($paymentIntent);

        $response = $this->actingAs($user)->get(
            route('orders.show', $order) . '?payment_intent=pi_success&redirect_status=succeeded'
        );

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Orders/Show')
            ->where('order.status', 'pending')
            ->where('paymentSuccess', true)
        );
        $this->assertSame('pending', $order->fresh()->status);

        // Webhook経由のジョブが実行された場合にのみステータスが更新されることを確認
        $job = new ProcessPaymentSuccess('pi_success', (string) $order->id, 'cus_123');
        $job->handle(app(OrderService::class));

        $this->assertSame('completed', $order->fresh()->status);
    }

    public function test_process_payment_success_requires_matching_amount_and_intent(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->create(['price' => 2000, 'is_active' => true]);
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

        // amount_received is intentionally mismatched
        $paymentIntent = (object) [
            'id' => 'pi_correct',
            'status' => 'succeeded',
            'amount_received' => 150000, // should be 200000 for 2000 JPY
            'metadata' => (object) ['order_id' => (string) $order->id],
        ];

        Mockery::mock('alias:Stripe\PaymentIntent')
            ->shouldReceive('retrieve')
            ->once()
            ->with('pi_correct')
            ->andReturn($paymentIntent);

        $job = new ProcessPaymentSuccess('pi_correct', (string) $order->id, 'cus_123');
        $job->handle(app(OrderService::class));

        $this->assertSame('pending', $order->fresh()->status);
    }
}


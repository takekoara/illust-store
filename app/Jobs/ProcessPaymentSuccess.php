<?php

namespace App\Jobs;

use App\Models\Order;
use App\Services\OrderService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;
use Stripe\PaymentIntent;
use Stripe\Stripe;

class ProcessPaymentSuccess implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public string $paymentIntentId,
        public ?string $orderId,
        public ?string $customerId = null
    ) {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(OrderService $orderService): void
    {
        // Retrieve payment intent for verification
        try {
            Stripe::setApiKey(config('services.stripe.secret'));
            $paymentIntent = PaymentIntent::retrieve($this->paymentIntentId);
        } catch (\Exception $e) {
            Log::error('ProcessPaymentSuccess: Failed to retrieve payment intent', [
                'payment_intent_id' => $this->paymentIntentId,
                'error' => $e->getMessage(),
            ]);
            return;
        }

        if (!$this->orderId) {
            Log::warning('ProcessPaymentSuccess: No order ID in metadata', [
                'payment_intent_id' => $this->paymentIntentId,
            ]);
            return;
        }

        $order = Order::find($this->orderId);
        if (!$order) {
            Log::warning('ProcessPaymentSuccess: Order not found', [
                'order_id' => $this->orderId,
                'payment_intent_id' => $this->paymentIntentId,
            ]);
            return;
        }

        if ($order->status !== 'pending') {
            Log::info('ProcessPaymentSuccess: Order already processed', [
                'order_id' => $order->id,
                'status' => $order->status,
            ]);
            return;
        }

        $amountMatches = $paymentIntent->amount_received === (int) ($order->total_amount * 100);
        $intentMatchesOrder = (string)($paymentIntent->metadata->order_id ?? '') === (string) $order->id;
        $intentMatchesStored = !$order->stripe_payment_intent_id || $order->stripe_payment_intent_id === $this->paymentIntentId;
        $isSucceeded = $paymentIntent->status === 'succeeded';

        if (!($amountMatches && $intentMatchesOrder && $intentMatchesStored && $isSucceeded)) {
            Log::warning('ProcessPaymentSuccess: Payment intent validation failed', [
                'order_id' => $order->id,
                'payment_intent_id' => $this->paymentIntentId,
                'amount_matches' => $amountMatches,
                'intent_matches_order' => $intentMatchesOrder,
                'intent_matches_stored' => $intentMatchesStored,
                'status' => $paymentIntent->status,
                'amount_received' => $paymentIntent->amount_received,
                'order_total_expected' => (int) ($order->total_amount * 100),
            ]);
            return;
        }

        // Update order status
        $order->update([
            'status' => 'completed',
            'stripe_customer_id' => $this->customerId,
            'stripe_payment_intent_id' => $order->stripe_payment_intent_id ?: $this->paymentIntentId,
        ]);

        // Load relationships
        $order->load(['items.product', 'user']);

        // Increment product sales count
        foreach ($order->items as $item) {
            if ($item->product) {
                $item->product->increment('sales_count');
            }
        }

        // Send email notification to buyer
        if ($order->user) {
            Log::info('Sending order completion email', [
                'order_id' => $order->id,
                'user_id' => $order->user->id,
                'user_email' => $order->user->email,
            ]);
            try {
                $order->user->notify(new \App\Notifications\OrderCompletedNotification($order));
                Log::info('Order completion email queued successfully', [
                    'order_id' => $order->id,
                ]);
            } catch (\Exception $e) {
                Log::error('Failed to send order completion email', [
                    'order_id' => $order->id,
                    'error' => $e->getMessage(),
                ]);
            }
        } else {
            Log::warning('Order has no user, cannot send email', [
                'order_id' => $order->id,
            ]);
        }
    }
}

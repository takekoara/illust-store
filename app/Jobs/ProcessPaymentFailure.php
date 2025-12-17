<?php

namespace App\Jobs;

use App\Models\Order;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

class ProcessPaymentFailure implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public string $paymentIntentId,
        public ?string $orderId
    ) {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        if (!$this->orderId) {
            Log::warning('ProcessPaymentFailure: No order ID in metadata', [
                'payment_intent_id' => $this->paymentIntentId,
            ]);
            return;
        }

        $order = Order::find($this->orderId);
        if (!$order) {
            Log::warning('ProcessPaymentFailure: Order not found', [
                'order_id' => $this->orderId,
                'payment_intent_id' => $this->paymentIntentId,
            ]);
            return;
        }

        if ($order->status === 'pending') {
            $order->update([
                'status' => 'cancelled',
            ]);

            Log::info('Payment failure: Order status updated to cancelled', [
                'order_id' => $order->id,
                'payment_intent_id' => $this->paymentIntentId,
            ]);

            // ユーザーに通知を送信（将来実装予定）
            // TODO: OrderCancelledNotificationを作成して有効化
        } else {
            Log::info('ProcessPaymentFailure: Order already processed', [
                'order_id' => $order->id,
                'status' => $order->status,
            ]);
        }
    }
}

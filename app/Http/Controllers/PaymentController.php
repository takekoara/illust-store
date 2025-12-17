<?php

namespace App\Http\Controllers;

use App\Jobs\ProcessPaymentFailure;
use App\Jobs\ProcessPaymentSuccess;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Stripe\Stripe;
use Stripe\PaymentIntent;
use Stripe\Webhook;
use Stripe\Exception\SignatureVerificationException;
use Stripe\Exception\ApiErrorException;

class PaymentController extends Controller
{
    public function __construct()
    {
        Stripe::setApiKey(config('services.stripe.secret'));
    }

    /**
     * Create payment intent for an order
     */
    public function createPaymentIntent(Request $request, Order $order)
    {
        if ($order->user_id !== Auth::id()) {
            abort(403);
        }

        if ($order->status !== 'pending') {
            return back()->with('error', 'この注文は既に処理済みです。');
        }

        try {
            // 注文金額の検証
            if ($order->total_amount <= 0) {
                Log::warning('Invalid order amount', [
                    'order_id' => $order->id,
                    'amount' => $order->total_amount,
                ]);
                return back()->with('error', '注文金額が無効です。');
            }

            $paymentIntent = PaymentIntent::create([
                'amount' => (int)($order->total_amount * 100), // Convert to cents
                'currency' => 'jpy',
                'metadata' => [
                    'order_id' => $order->id,
                    'user_id' => Auth::id(),
                ],
            ]);

            $order->update([
                'stripe_payment_intent_id' => $paymentIntent->id,
            ]);

            return response()->json([
                'clientSecret' => $paymentIntent->client_secret,
            ]);
        } catch (ApiErrorException $e) {
            // Stripe API固有のエラー
            $errorMessage = $this->getStripeErrorMessage($e);
            Log::error('Stripe Payment Intent API Error', [
                'order_id' => $order->id,
                'error' => $e->getMessage(),
                'stripe_error_code' => $e->getStripeCode(),
                'user_id' => Auth::id(),
            ]);
            
            return back()->with('error', $errorMessage);
        } catch (\Exception $e) {
            // その他のエラー
            Log::error('Stripe Payment Intent Error', [
                'order_id' => $order->id,
                'error' => $e->getMessage(),
                'trace' => config('app.debug') ? $e->getTraceAsString() : null,
                'user_id' => Auth::id(),
            ]);
            
            $message = config('app.debug') 
                ? '支払い処理の作成に失敗しました: ' . $e->getMessage()
                : '支払い処理の作成に失敗しました。しばらくしてから再度お試しください。';
            
            return back()->with('error', $message);
        }
    }

    /**
     * Handle Stripe webhook
     */
    public function handleWebhook(Request $request)
    {
        $payload = $request->getContent();
        $sigHeader = $request->header('Stripe-Signature');
        $endpointSecret = config('services.stripe.webhook_secret');

        try {
            $event = Webhook::constructEvent($payload, $sigHeader, $endpointSecret);
        } catch (\UnexpectedValueException $e) {
            Log::error('Invalid payload: ' . $e->getMessage());
            return response()->json(['error' => 'Invalid payload'], 400);
        } catch (SignatureVerificationException $e) {
            Log::error('Invalid signature: ' . $e->getMessage());
            return response()->json(['error' => 'Invalid signature'], 400);
        }

        // Handle the event (dispatch to queue for async processing)
        switch ($event->type) {
            case 'payment_intent.succeeded':
                $paymentIntent = $event->data->object;
                // Dispatch job to queue for async processing
                ProcessPaymentSuccess::dispatch(
                    $paymentIntent->id,
                    $paymentIntent->metadata->order_id ?? null,
                    $paymentIntent->customer ?? null
                );
                Log::info('Payment success job dispatched', [
                    'payment_intent_id' => $paymentIntent->id,
                    'order_id' => $paymentIntent->metadata->order_id ?? null,
                ]);
                break;

            case 'payment_intent.payment_failed':
                $paymentIntent = $event->data->object;
                // Dispatch job to queue for async processing
                ProcessPaymentFailure::dispatch(
                    $paymentIntent->id,
                    $paymentIntent->metadata->order_id ?? null
                );
                Log::info('Payment failure job dispatched', [
                    'payment_intent_id' => $paymentIntent->id,
                    'order_id' => $paymentIntent->metadata->order_id ?? null,
                ]);
                break;

            default:
                Log::info('Unhandled event type: ' . $event->type);
        }

        return response()->json(['received' => true]);
    }

    /**
     * Get user-friendly error message from Stripe exception
     */
    protected function getStripeErrorMessage(ApiErrorException $e): string
    {
        $stripeCode = $e->getStripeCode();
        
        // ユーザーフレンドリーなエラーメッセージ
        $messages = [
            'card_declined' => 'カードが拒否されました。別のカードをお試しください。',
            'insufficient_funds' => '残高が不足しています。',
            'expired_card' => 'カードの有効期限が切れています。',
            'incorrect_cvc' => 'CVCコードが正しくありません。',
            'processing_error' => '決済処理中にエラーが発生しました。',
            'invalid_request_error' => 'リクエストが無効です。',
        ];

        if (isset($messages[$stripeCode])) {
            return $messages[$stripeCode];
        }

        // 開発環境では詳細なエラーを表示
        if (config('app.debug')) {
            return '支払い処理の作成に失敗しました: ' . $e->getMessage();
        }

        return '支払い処理の作成に失敗しました。カード情報を確認して再度お試しください。';
    }

    /**
     * Handle successful payment
     * 
     * @deprecated This method is no longer used. Processing is now done asynchronously via ProcessPaymentSuccess job.
     */
    protected function handlePaymentSuccess($paymentIntent)
    {
        $orderId = $paymentIntent->metadata->order_id ?? null;

        if ($orderId) {
            $order = Order::find($orderId);
            if ($order && $order->status === 'pending') {
                $order->update([
                    'status' => 'completed',
                    'stripe_customer_id' => $paymentIntent->customer ?? null,
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
                $emailSent = false;
                if ($order->user) {
                    Log::info('Sending order completion email', [
                        'order_id' => $order->id,
                        'user_id' => $order->user->id,
                        'user_email' => $order->user->email,
                    ]);
                    try {
                        $order->user->notify(new \App\Notifications\OrderCompletedNotification($order));
                        $emailSent = true;
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
                
                // Email sent status is handled via flash message in OrderController
                // For portfolio purposes, the email notification is sent and logged
            }
        }
    }

    /**
     * Handle failed payment
     * 
     * @deprecated This method is no longer used. Processing is now done asynchronously via ProcessPaymentFailure job.
     */
    protected function handlePaymentFailure($paymentIntent)
    {
        $orderId = $paymentIntent->metadata->order_id ?? null;

        if (!$orderId) {
            Log::warning('Payment failure: No order ID in metadata', [
                'payment_intent_id' => $paymentIntent->id ?? null,
            ]);
            return;
        }

        $order = Order::find($orderId);
        if (!$order) {
            Log::warning('Payment failure: Order not found', [
                'order_id' => $orderId,
                'payment_intent_id' => $paymentIntent->id ?? null,
            ]);
            return;
        }

        if ($order->status === 'pending') {
            $order->update([
                'status' => 'cancelled',
            ]);

            // ユーザーに通知を送信（将来実装予定）
            // TODO: OrderCancelledNotificationを作成して有効化
            // try {
            //     if ($order->user) {
            //         $order->user->notify(new \App\Notifications\OrderCancelledNotification($order));
            //         Log::info('Order cancellation notification sent', [
            //             'order_id' => $order->id,
            //             'user_id' => $order->user->id,
            //         ]);
            //     }
            // } catch (\Exception $e) {
            //     Log::error('Failed to send order cancellation notification', [
            //         'order_id' => $order->id,
            //         'error' => $e->getMessage(),
            //     ]);
            // }
        } else {
            Log::info('Payment failure: Order already processed', [
                'order_id' => $order->id,
                'status' => $order->status,
            ]);
        }
    }
}


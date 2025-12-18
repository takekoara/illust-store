<?php

namespace App\Http\Controllers;

use App\Jobs\ProcessPaymentFailure;
use App\Jobs\ProcessPaymentSuccess;
use App\Models\Order;
use App\Services\StripeService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Stripe\Exception\SignatureVerificationException;
use Stripe\Webhook;

class PaymentController extends Controller
{
    public function __construct(
        private readonly StripeService $stripeService
    ) {}

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

        if ($order->total_amount <= 0) {
            Log::warning('Invalid order amount', [
                'order_id' => $order->id,
                'amount' => $order->total_amount,
            ]);

            return back()->with('error', '注文金額が無効です。');
        }

        $result = $this->stripeService->createPaymentIntent(
            $this->stripeService->toStripeAmount($order->total_amount),
            [
                'order_id' => $order->id,
                'user_id' => Auth::id(),
            ]
        );

        if (! $result['success']) {
            return back()->with('error', $result['error']);
        }

        $order->update(['stripe_payment_intent_id' => $result['paymentIntent']->id]);

        return response()->json([
            'clientSecret' => $result['clientSecret'],
        ]);
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
            Log::error('Invalid payload: '.$e->getMessage());

            return response()->json(['error' => 'Invalid payload'], 400);
        } catch (SignatureVerificationException $e) {
            Log::error('Invalid signature: '.$e->getMessage());

            return response()->json(['error' => 'Invalid signature'], 400);
        }

        switch ($event->type) {
            case 'payment_intent.succeeded':
                $paymentIntent = $event->data->object;
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
                Log::info('Unhandled event type: '.$event->type);
        }

        return response()->json(['received' => true]);
    }
}

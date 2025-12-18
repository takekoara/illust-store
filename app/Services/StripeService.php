<?php

namespace App\Services;

use App\Models\Order;
use Illuminate\Support\Facades\Log;
use Stripe\Exception\ApiErrorException;
use Stripe\PaymentIntent;
use Stripe\Stripe;

class StripeService
{
    public function __construct()
    {
        Stripe::setApiKey(config('services.stripe.secret'));
    }

    /**
     * Check if Stripe is configured
     */
    public function isConfigured(): bool
    {
        return !empty(config('services.stripe.secret'));
    }

    /**
     * Create a payment intent
     */
    public function createPaymentIntent(int $amount, array $metadata = []): array
    {
        if (!$this->isConfigured()) {
            return [
                'success' => false,
                'error' => config('app.debug')
                    ? 'StripeのAPIキーが設定されていません。.envファイルにSTRIPE_SECRETを設定してください。'
                    : '決済処理の初期化に失敗しました。管理者にお問い合わせください。',
            ];
        }

        try {
            $paymentIntent = PaymentIntent::create([
                'amount' => $amount,
                'currency' => 'jpy',
                'metadata' => $metadata,
            ]);

            return [
                'success' => true,
                'paymentIntent' => $paymentIntent,
                'clientSecret' => $paymentIntent->client_secret,
            ];
        } catch (ApiErrorException $e) {
            Log::error('Stripe Payment Intent API Error', [
                'error' => $e->getMessage(),
                'stripe_error_code' => $e->getStripeCode(),
                'metadata' => $metadata,
            ]);

            return [
                'success' => false,
                'error' => $this->getStripeErrorMessage($e),
            ];
        } catch (\Exception $e) {
            Log::error('Stripe Payment Intent Error', [
                'error' => $e->getMessage(),
                'metadata' => $metadata,
            ]);

            return [
                'success' => false,
                'error' => config('app.debug')
                    ? '決済処理エラー: ' . $e->getMessage()
                    : '決済処理の初期化に失敗しました。しばらくしてから再度お試しください。',
            ];
        }
    }

    /**
     * Retrieve a payment intent
     */
    public function retrievePaymentIntent(string $paymentIntentId): ?PaymentIntent
    {
        try {
            return PaymentIntent::retrieve($paymentIntentId);
        } catch (\Exception $e) {
            Log::warning('Failed to retrieve payment intent', [
                'payment_intent_id' => $paymentIntentId,
                'error' => $e->getMessage(),
            ]);
            return null;
        }
    }

    /**
     * Verify payment for an order
     */
    public function verifyPayment(Order $order, ?string $paymentIntentId = null): array
    {
        $intentId = $paymentIntentId ?? $order->stripe_payment_intent_id;

        if (!$intentId) {
            return [
                'verified' => false,
                'status' => null,
            ];
        }

        $paymentIntent = $this->retrievePaymentIntent($intentId);

        if (!$paymentIntent) {
            return [
                'verified' => false,
                'status' => null,
            ];
        }

        $orderIdInMeta = $paymentIntent->metadata->order_id ?? null;
        $amountMatches = $paymentIntent->amount_received === (int)($order->total_amount * 100);
        $intentMatchesOrder = $orderIdInMeta && (int)$orderIdInMeta === $order->id;
        $intentMatchesStored = !$order->stripe_payment_intent_id || $order->stripe_payment_intent_id === $intentId;

        $verified = $paymentIntent->status === 'succeeded' 
            && $amountMatches 
            && $intentMatchesOrder 
            && $intentMatchesStored;

        return [
            'verified' => $verified,
            'status' => $paymentIntent->status,
            'paymentIntentId' => $intentId,
        ];
    }

    /**
     * Get user-friendly error message from Stripe exception
     */
    public function getStripeErrorMessage(ApiErrorException $e): string
    {
        $stripeCode = $e->getStripeCode();

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

        if (config('app.debug')) {
            return '支払い処理の作成に失敗しました: ' . $e->getMessage();
        }

        return '支払い処理の作成に失敗しました。カード情報を確認して再度お試しください。';
    }

    /**
     * Convert amount to Stripe format (cents)
     */
    public function toStripeAmount(float $amount): int
    {
        return (int)($amount * 100);
    }

    /**
     * Convert from Stripe amount (cents) to regular amount
     */
    public function fromStripeAmount(int $amount): float
    {
        return $amount / 100;
    }
}


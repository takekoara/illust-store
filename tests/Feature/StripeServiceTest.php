<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\User;
use App\Services\StripeService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StripeServiceTest extends TestCase
{
    use RefreshDatabase;

    private StripeService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = app(StripeService::class);
    }

    public function test_is_configured_returns_false_when_no_secret(): void
    {
        // Temporarily override config
        config(['services.stripe.secret' => null]);

        $service = new StripeService;
        $this->assertFalse($service->isConfigured());
    }

    public function test_is_configured_returns_true_when_secret_exists(): void
    {
        config(['services.stripe.secret' => 'sk_test_123']);

        $service = new StripeService;
        $this->assertTrue($service->isConfigured());
    }

    public function test_create_payment_intent_fails_when_not_configured(): void
    {
        config(['services.stripe.secret' => null]);

        $service = new StripeService;
        $result = $service->createPaymentIntent(1000, []);

        $this->assertFalse($result['success']);
        $this->assertArrayHasKey('error', $result);
    }

    public function test_to_stripe_amount_converts_correctly(): void
    {
        $this->assertEquals(1000, $this->service->toStripeAmount(10.00));
        $this->assertEquals(2550, $this->service->toStripeAmount(25.50));
        $this->assertEquals(100, $this->service->toStripeAmount(1.00));
    }

    public function test_from_stripe_amount_converts_correctly(): void
    {
        $this->assertEquals(10.00, $this->service->fromStripeAmount(1000));
        $this->assertEquals(25.50, $this->service->fromStripeAmount(2550));
        $this->assertEquals(1.00, $this->service->fromStripeAmount(100));
    }

    public function test_verify_payment_returns_false_without_payment_intent(): void
    {
        $user = User::factory()->create();
        $order = Order::factory()->create([
            'user_id' => $user->id,
            'stripe_payment_intent_id' => null,
        ]);

        $result = $this->service->verifyPayment($order);

        $this->assertFalse($result['verified']);
        $this->assertNull($result['status']);
    }

    public function test_get_stripe_error_message_returns_known_errors(): void
    {
        $mockException = $this->createMock(\Stripe\Exception\ApiErrorException::class);
        $mockException->method('getStripeCode')->willReturn('card_declined');

        $message = $this->service->getStripeErrorMessage($mockException);

        $this->assertEquals('カードが拒否されました。別のカードをお試しください。', $message);
    }

    public function test_get_stripe_error_message_for_insufficient_funds(): void
    {
        $mockException = $this->createMock(\Stripe\Exception\ApiErrorException::class);
        $mockException->method('getStripeCode')->willReturn('insufficient_funds');

        $message = $this->service->getStripeErrorMessage($mockException);

        $this->assertEquals('残高が不足しています。', $message);
    }

    public function test_get_stripe_error_message_for_expired_card(): void
    {
        $mockException = $this->createMock(\Stripe\Exception\ApiErrorException::class);
        $mockException->method('getStripeCode')->willReturn('expired_card');

        $message = $this->service->getStripeErrorMessage($mockException);

        $this->assertEquals('カードの有効期限が切れています。', $message);
    }

    public function test_get_stripe_error_message_for_incorrect_cvc(): void
    {
        $mockException = $this->createMock(\Stripe\Exception\ApiErrorException::class);
        $mockException->method('getStripeCode')->willReturn('incorrect_cvc');

        $message = $this->service->getStripeErrorMessage($mockException);

        $this->assertEquals('CVCコードが正しくありません。', $message);
    }

    public function test_get_stripe_error_message_for_unknown_error_in_debug_mode(): void
    {
        config(['app.debug' => true]);

        // Stripe例外は継承で作成
        $mockException = new class('Test error message', 400) extends \Stripe\Exception\ApiErrorException
        {
            public function getStripeCode(): ?string
            {
                return 'unknown_error';
            }
        };

        $message = $this->service->getStripeErrorMessage($mockException);

        $this->assertStringContainsString('Test error message', $message);
    }

    public function test_get_stripe_error_message_for_unknown_error_in_production(): void
    {
        config(['app.debug' => false]);

        $mockException = new class('Secret error details', 400) extends \Stripe\Exception\ApiErrorException
        {
            public function getStripeCode(): ?string
            {
                return 'unknown_error';
            }
        };

        $message = $this->service->getStripeErrorMessage($mockException);

        $this->assertStringNotContainsString('Secret error details', $message);
        $this->assertEquals('支払い処理の作成に失敗しました。カード情報を確認して再度お試しください。', $message);
    }
}

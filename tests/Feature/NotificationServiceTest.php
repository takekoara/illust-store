<?php

namespace Tests\Feature;

use App\Models\CustomNotification;
use App\Models\Product;
use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class NotificationServiceTest extends TestCase
{
    use RefreshDatabase;

    protected NotificationService $notificationService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->notificationService = app(NotificationService::class);
    }

    public function test_can_create_notification(): void
    {
        $user = User::factory()->create();

        $notification = $this->notificationService->createNotification(
            $user,
            'test',
            'Test Title',
            'Test Message',
            '/test-link',
            ['key' => 'value']
        );

        $this->assertDatabaseHas('notifications', [
            'id' => $notification->id,
            'user_id' => $user->id,
            'type' => 'test',
            'title' => 'Test Title',
            'message' => 'Test Message',
            'link' => '/test-link',
            'is_read' => false,
        ]);
    }

    public function test_can_notify_like(): void
    {
        $seller = User::factory()->create();
        $liker = User::factory()->create();
        $product = Product::factory()->create(['user_id' => $seller->id]);

        $this->notificationService->notifyLike($product, $liker);

        // 1. 通知が作成される
        $this->assertDatabaseHas('notifications', [
            'user_id' => $seller->id,
            'type' => 'like',
            'title' => '新しいいいね',
        ]);

        // 2. linkが正しいか（product.showにアクセスするか）
        $notification = CustomNotification::where('type', 'like')->first();
        $this->assertEquals(route('products.show', $product->id), $notification->link);

        // 3. dataが正しいか（その際、データもあるか）
        $this->assertEquals($product->id, $notification->data['product_id']);
        $this->assertEquals($liker->id, $notification->data['liker_id']);
    }

    public function test_notify_like_throws_type_error_with_invalid_product(): void
    {
        $liker = User::factory()->create();

        $this->expectException(\TypeError::class);
        // @phpstan-ignore-next-line
        $this->notificationService->notifyLike('invalid_string', $liker);
    }

    public function test_notify_like_throws_type_error_with_invalid_user(): void
    {
        $product = Product::factory()->create();

        $this->expectException(\TypeError::class);
        // @phpstan-ignore-next-line
        $this->notificationService->notifyLike($product, 'invalid_string');
    }

    public function test_does_not_notify_own_like(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->create(['user_id' => $user->id]);

        $this->notificationService->notifyLike($product, $user);

        $this->assertDatabaseMissing('notifications', [
            'user_id' => $user->id,
            'type' => 'like',
        ]);
    }

    public function test_can_notify_follow(): void
    {
        $followed = User::factory()->create();
        $follower = User::factory()->create();

        $this->notificationService->notifyFollow($followed, $follower);

        $this->assertDatabaseHas('notifications', [
            'user_id' => $followed->id,
            'type' => 'follow',
            'title' => '新しいフォロワー',
        ]);
    }

    public function test_can_mark_notification_as_read(): void
    {
        $user = User::factory()->create();
        $notification = CustomNotification::factory()->create([
            'user_id' => $user->id,
            'is_read' => false,
        ]);

        $result = $this->notificationService->markAsRead($notification);

        $this->assertTrue($result);
        $this->assertTrue($notification->fresh()->is_read);
    }

    public function test_can_mark_all_notifications_as_read(): void
    {
        $user = User::factory()->create();
        CustomNotification::factory()->count(5)->create([
            'user_id' => $user->id,
            'is_read' => false,
        ]);

        $count = $this->notificationService->markAllAsRead($user);

        $this->assertEquals(5, $count);
        $this->assertEquals(0, CustomNotification::where('user_id', $user->id)->where('is_read', false)->count());
    }
}

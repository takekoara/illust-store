<?php

namespace App\Notifications;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\Log;

// 開発環境では同期的に送信するため、ShouldQueueをコメントアウト
// 本番環境でキューを使用する場合は、ShouldQueueを有効化してください
class OrderCompletedNotification extends Notification // implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(
        public Order $order
    ) {
        //
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        Log::info('OrderCompletedNotification::toMail called', [
            'order_id' => $this->order->id,
            'user_id' => $notifiable->id,
            'user_email' => $notifiable->email,
        ]);

        $order = $this->order;
        $order->load([
            'items' => function ($query) {
                $query->with(['product' => function ($q) {
                    $q->withTrashed()->with('images');
                }]);
            }
        ]);

        $mailMessage = (new MailMessage)
            ->subject('注文が完了しました - ' . $order->order_number)
            ->greeting('こんにちは、' . $notifiable->name . 'さん')
            ->line('ご注文ありがとうございます。')
            ->line('以下の注文が正常に完了しました。')
            ->line('**注文番号:** ' . $order->order_number)
            ->line('**注文日時:** ' . $order->created_at->format('Y年m月d日 H:i'))
            ->line('**合計金額:** ¥' . number_format($order->total_amount, 0))
            ->line('**ステータス:** 完了');

        // 注文商品の詳細を追加
        if ($order->items->isNotEmpty()) {
            $mailMessage->line('**注文内容:**');
            foreach ($order->items as $item) {
                $productTitle = $item->product ? $item->product->title : '商品情報が取得できませんでした';
                $mailMessage->line('- ' . $productTitle . ' (¥' . number_format($item->price, 0) . ')');
            }
        }

        // 請求先情報を追加
        if ($order->billing_address) {
            $billing = $order->billing_address;
            $mailMessage
                ->line('**請求先情報:**')
                ->line('お名前: ' . ($billing['name'] ?? ''))
                ->line('メールアドレス: ' . ($billing['email'] ?? ''))
                ->line('住所: ' . ($billing['address'] ?? '') . ' ' . ($billing['city'] ?? '') . ' ' . ($billing['postal_code'] ?? ''));
        }

        $mailMessage
            ->action('注文詳細を確認', url('/orders/' . $order->id))
            ->line('ご不明な点がございましたら、お気軽にお問い合わせください。')
            ->line('今後ともよろしくお願いいたします。');

        return $mailMessage;
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'order_id' => $this->order->id,
            'order_number' => $this->order->order_number,
            'total_amount' => $this->order->total_amount,
        ];
    }
}

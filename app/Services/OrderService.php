<?php

namespace App\Services;

use App\Models\CartItem;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class OrderService
{
    /**
     * Create an order from cart items
     */
    public function createOrderFromCart(array $billingAddress, ?int $tempOrderId = null): Order
    {
        $cartItems = CartItem::with(['product' => function ($q) {
            $q->withTrashed();
        }])
            ->where('user_id', Auth::id())
            ->get();

        if ($cartItems->isEmpty()) {
            throw new \Exception('カートが空です。');
        }

        // Validate products
        $invalidItems = $cartItems->filter(function ($item) {
            return ! $item->product || ! $item->product->is_active || $item->product->price <= 0;
        });

        if ($invalidItems->isNotEmpty()) {
            throw new \Exception('カートに無効な商品が含まれています。');
        }

        $total = $cartItems->sum(function ($item) {
            return $item->product->price;
        });

        if ($total <= 0) {
            throw new \Exception('注文金額が無効です。');
        }

        return DB::transaction(function () use ($billingAddress, $tempOrderId, $cartItems, $total) {
            // Use existing temp order or create new one
            if ($tempOrderId) {
                $order = Order::find($tempOrderId);
                if ($order && $order->user_id === Auth::id() && $order->status === 'pending') {
                    $order->update(['billing_address' => $billingAddress]);
                } else {
                    $order = Order::create([
                        'user_id' => Auth::id(),
                        'total_amount' => $total,
                        'status' => 'pending',
                        'billing_address' => $billingAddress,
                    ]);
                }
            } else {
                $order = Order::create([
                    'user_id' => Auth::id(),
                    'total_amount' => $total,
                    'status' => 'pending',
                    'billing_address' => $billingAddress,
                ]);
            }

            // Create order items if they don't exist
            $order->refresh();
            if ($order->items->isEmpty()) {
                foreach ($cartItems as $cartItem) {
                    if (! $cartItem->product) {
                        Log::warning('Cart item has no product', [
                            'cart_item_id' => $cartItem->id,
                            'product_id' => $cartItem->product_id,
                        ]);

                        continue;
                    }

                    OrderItem::create([
                        'order_id' => $order->id,
                        'product_id' => $cartItem->product_id,
                        'price' => $cartItem->product->price,
                    ]);
                }
            }

            // Clear cart
            CartItem::where('user_id', Auth::id())->delete();

            // Clear dashboard cache
            Cache::forget('dashboard.stats.user.'.Auth::id());

            return $order->fresh(['items.product']);
        });
    }

    /**
     * Complete an order (called from webhook)
     */
    public function completeOrder(Order $order): bool
    {
        return DB::transaction(function () use ($order) {
            if ($order->status !== 'pending') {
                return false;
            }

            $order->update(['status' => 'completed']);

            // Increment product sales count
            foreach ($order->items as $item) {
                if ($item->product) {
                    $item->product->increment('sales_count');
                }
            }

            // Clear cache
            Cache::forget('dashboard.stats.user.'.$order->user_id);
            Cache::forget('dashboard.stats.admin');

            return true;
        });
    }
}

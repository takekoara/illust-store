<?php

namespace App\Services;

use App\Models\Product;
use App\Models\ProductView;
use App\Models\User;
use Illuminate\Http\Request;

class ProductViewService
{
    /**
     * Record a product view
     */
    public function recordView(Product $product, ?User $user, Request $request): void
    {
        $product->increment('views');

        if ($user) {
            $this->recordUserView($product, $user, $request);
        } else {
            $this->recordGuestView($product, $request);
        }
    }

    /**
     * Record view for logged-in user
     */
    private function recordUserView(Product $product, User $user, Request $request): void
    {
        // 同じ商品を最近（1時間以内）見た場合は記録しない
        $recentView = ProductView::where('user_id', $user->id)
            ->where('product_id', $product->id)
            ->where('viewed_at', '>', now()->subHour())
            ->exists();

        if (!$recentView) {
            ProductView::create([
                'user_id' => $user->id,
                'product_id' => $product->id,
                'viewed_at' => now(),
                'ip_address' => $request->ip(),
            ]);
        }
    }

    /**
     * Record view for guest user (by IP)
     */
    private function recordGuestView(Product $product, Request $request): void
    {
        $recentView = ProductView::whereNull('user_id')
            ->where('product_id', $product->id)
            ->where('ip_address', $request->ip())
            ->where('viewed_at', '>', now()->subHour())
            ->exists();

        if (!$recentView) {
            ProductView::create([
                'user_id' => null,
                'product_id' => $product->id,
                'viewed_at' => now(),
                'ip_address' => $request->ip(),
            ]);
        }
    }
}


<?php

namespace App\Http\Controllers;

use App\Models\Like;
use App\Models\Product;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;

class LikeController extends Controller
{
    /**
     * Toggle like for a product
     */
    public function toggle(Product $product)
    {
        if (!Auth::check()) {
            return back()->with('error', 'いいねするにはログインが必要です。');
        }

        // レート制限: 1分間に最大60いいね
        $key = 'toggle-like:' . Auth::id();
        if (RateLimiter::tooManyAttempts($key, 60)) {
            $seconds = RateLimiter::availableIn($key);
            return response()->json([
                'error' => "いいねの操作が多すぎます。{$seconds}秒後に再度お試しください。",
            ], 429);
        }
        RateLimiter::hit($key, 60); // 60秒のウィンドウ

        $like = Like::where('user_id', Auth::id())
            ->where('product_id', $product->id)
            ->first();

        if ($like) {
            $like->delete();
            $isLiked = false;
        } else {
            Like::create([
                'user_id' => Auth::id(),
                'product_id' => $product->id,
            ]);
            $isLiked = true;
            
            // 通知を送信（いいねした場合のみ）
            $notificationService = app(NotificationService::class);
            $notificationService->notifyLike($product, Auth::user());
        }

        $likeCount = Like::where('product_id', $product->id)->count();

        return response()->json([
            'is_liked' => $isLiked,
            'like_count' => $likeCount,
        ]);
    }

    /**
     * Get like status for a product
     */
    public function status(Product $product)
    {
        $isLiked = false;
        if (Auth::check()) {
            $isLiked = Like::where('user_id', Auth::id())
                ->where('product_id', $product->id)
                ->exists();
        }

        $likeCount = Like::where('product_id', $product->id)->count();

        return response()->json([
            'is_liked' => $isLiked,
            'like_count' => $likeCount,
        ]);
    }
}

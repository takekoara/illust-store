<?php

namespace App\Http\Controllers;

use App\Models\Bookmark;
use App\Models\Product;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;

class BookmarkController extends Controller
{
    /**
     * Toggle bookmark for a product
     */
    public function toggle(Product $product)
    {
        if (!Auth::check()) {
            return back()->with('error', 'ブックマークするにはログインが必要です。');
        }

        // レート制限: 1分間に最大60ブックマーク
        $key = 'toggle-bookmark:' . Auth::id();
        if (RateLimiter::tooManyAttempts($key, 60)) {
            $seconds = RateLimiter::availableIn($key);
            return response()->json([
                'error' => "ブックマークの操作が多すぎます。{$seconds}秒後に再度お試しください。",
            ], 429);
        }
        RateLimiter::hit($key, 60); // 60秒のウィンドウ

        $bookmark = Bookmark::where('user_id', Auth::id())
            ->where('product_id', $product->id)
            ->first();

        if ($bookmark) {
            $bookmark->delete();
            $isBookmarked = false;
        } else {
            Bookmark::create([
                'user_id' => Auth::id(),
                'product_id' => $product->id,
            ]);
            $isBookmarked = true;
            
            // 通知を送信（ブックマークした場合のみ）
            $notificationService = app(NotificationService::class);
            $notificationService->notifyBookmark($product, Auth::user());
        }

        $bookmarkCount = Bookmark::where('product_id', $product->id)->count();

        return response()->json([
            'is_bookmarked' => $isBookmarked,
            'bookmark_count' => $bookmarkCount,
        ]);
    }

    /**
     * Get bookmark status for a product
     */
    public function status(Product $product)
    {
        $isBookmarked = false;
        if (Auth::check()) {
            $isBookmarked = Bookmark::where('user_id', Auth::id())
                ->where('product_id', $product->id)
                ->exists();
        }

        $bookmarkCount = Bookmark::where('product_id', $product->id)->count();

        return response()->json([
            'is_bookmarked' => $isBookmarked,
            'bookmark_count' => $bookmarkCount,
        ]);
    }

    /**
     * Display a listing of bookmarks
     */
    public function index()
    {
        $bookmarks = Bookmark::where('user_id', Auth::id())
            ->with(['product.images', 'product.user', 'product.tags'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return \Inertia\Inertia::render('Bookmarks/Index', [
            'bookmarks' => $bookmarks,
        ]);
    }
}

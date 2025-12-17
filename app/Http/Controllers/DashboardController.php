<?php

namespace App\Http\Controllers;

use App\Models\Bookmark;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the dashboard.
     */
    public function index(Request $request): Response
    {
        $user = Auth::user();

        if ($user->isAdmin()) {
            // Admin dashboard（統計情報をキャッシュ - 5分間）
            $cacheKey = 'dashboard.stats.admin';
            $stats = Cache::remember($cacheKey, 300, function () {
                return [
                    'total_products' => Product::count(),
                    'active_products' => Product::where('is_active', true)->count(),
                    'total_users' => User::count(),
                    'total_orders' => Order::count(),
                    'total_revenue' => Order::where('status', 'completed')->sum('total_amount'),
                    'pending_orders' => Order::where('status', 'pending')->count(),
                ];
            });
            
            // 最近の注文・商品はキャッシュしない（リアルタイム性が重要）
            $stats['recent_orders'] = Order::with(['user', 'items.product'])
                ->orderBy('created_at', 'desc')
                ->limit(5)
                ->get();
            $stats['recent_products'] = Product::with(['user', 'images'])
                ->orderBy('created_at', 'desc')
                ->limit(5)
                ->get();
        } else {
            // User dashboard
            $stats = [
                'my_products' => Product::where('user_id', $user->id)->count(),
                'my_active_products' => Product::where('user_id', $user->id)
                    ->where('is_active', true)
                    ->count(),
                'my_orders' => Order::where('user_id', $user->id)->count(),
                'my_cart_items' => $user->cartItems()->count(),
                'my_followers' => $user->followers()->count(),
                'my_following' => $user->following()->count(),
                'my_bookmarks_count' => Bookmark::where('user_id', $user->id)->count(), // Added
                'recent_orders' => Order::where('user_id', $user->id)
                    ->with(['items.product'])
                    ->orderBy('created_at', 'desc')
                    ->limit(5)
                    ->get(),
            ];

            // ブックマーク一覧を取得（ダッシュボード用に8件に制限）
            $bookmarks = Bookmark::where('user_id', $user->id)
                ->whereHas('product') // 削除された商品を事前に除外
                ->with(['product.images', 'product.user'])
                ->orderBy('created_at', 'desc')
                ->limit(8)
                ->get()
                ->pluck('product')
                ->filter(); // nullを除外
        }

        return Inertia::render('Dashboard', [
            'stats' => $stats,
            'isAdmin' => $user->isAdmin(),
            'bookmarks' => $bookmarks ?? [],
        ]);
    }
}

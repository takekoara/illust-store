<?php

namespace App\Services;

use App\Models\Bookmark;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Facades\Cache;

class DashboardService
{
    /**
     * Get admin dashboard statistics
     */
    public function getAdminStats(): array
    {
        // 統計情報をキャッシュ - 5分間
        $stats = Cache::remember('dashboard.stats.admin', 300, function () {
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
        $stats['recent_orders'] = $this->getRecentOrders();
        $stats['recent_products'] = $this->getRecentProducts();

        return $stats;
    }

    /**
     * Get user dashboard statistics
     */
    public function getUserStats(User $user): array
    {
        return [
            'my_products' => Product::where('user_id', $user->id)->count(),
            'my_active_products' => Product::where('user_id', $user->id)
                ->where('is_active', true)
                ->count(),
            'my_orders' => Order::where('user_id', $user->id)->count(),
            'my_cart_items' => $user->cartItems()->count(),
            'my_followers' => $user->followers()->count(),
            'my_following' => $user->following()->count(),
            'my_bookmarks_count' => Bookmark::where('user_id', $user->id)->count(),
            'recent_orders' => Order::where('user_id', $user->id)
                ->with(['items.product'])
                ->orderBy('created_at', 'desc')
                ->limit(5)
                ->get(),
        ];
    }

    /**
     * Get user bookmarks for dashboard
     */
    public function getUserBookmarks(User $user, int $limit = 8)
    {
        return Bookmark::where('user_id', $user->id)
            ->whereHas('product') // 削除された商品を事前に除外
            ->with(['product.images', 'product.user'])
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get()
            ->pluck('product')
            ->filter(); // nullを除外
    }

    /**
     * Get recent orders for admin dashboard
     */
    private function getRecentOrders(int $limit = 5)
    {
        return Order::with(['user', 'items.product'])
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();
    }

    /**
     * Get recent products for admin dashboard
     */
    private function getRecentProducts(int $limit = 5)
    {
        return Product::with(['user', 'images'])
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();
    }
}


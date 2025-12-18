<?php

namespace App\Services;

use App\Models\Product;
use App\Models\Tag;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;

class WelcomeService
{
    private const PRODUCTS_LIMIT = 12;

    private const TAGS_CACHE_TTL = 3600;

    /**
     * Get popular products (sorted by engagement score)
     */
    public function getPopularProducts(): Collection
    {
        // PostgreSQL互換: サブクエリを直接ORDER BY句に埋め込む
        return Product::with(['user:id,name,username', 'images', 'tags'])
            ->where('is_active', true)
            ->withCount(['likes', 'bookmarks', 'productViews'])
            ->orderByRaw('(
                (SELECT COUNT(*) FROM likes WHERE likes.product_id = products.id) * 1.0 +
                (SELECT COUNT(*) FROM bookmarks WHERE bookmarks.product_id = products.id) * 1.5 +
                (SELECT COUNT(*) FROM product_views WHERE product_views.product_id = products.id) * 0.5 +
                sales_count * 2.0
            ) DESC')
            ->limit(self::PRODUCTS_LIMIT)
            ->get();
    }

    /**
     * Get new products
     */
    public function getNewProducts(): Collection
    {
        return Product::with(['user:id,name,username', 'images', 'tags'])
            ->where('is_active', true)
            ->orderBy('created_at', 'desc')
            ->limit(self::PRODUCTS_LIMIT)
            ->get();
    }

    /**
     * Get popular tags (cached)
     */
    public function getPopularTags(): Collection
    {
        return Cache::remember('popular_tags', self::TAGS_CACHE_TTL, function () {
            return Tag::whereHas('products', function ($query) {
                $query->where('is_active', true);
            })
                ->withCount(['products' => function ($query) {
                    $query->where('is_active', true);
                }])
                ->orderBy('products_count', 'desc')
                ->limit(20)
                ->get();
        });
    }
}

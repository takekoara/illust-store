<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Product;
use App\Models\ProductView;
use App\Models\User;
use Illuminate\Support\Collection;

class RecommendationService
{
    // 推薦アルゴリズムの重み定数
    private const TAG_SIMILARITY_WEIGHT = 40;

    private const ENGAGEMENT_WEIGHT = 30;

    private const VIEW_HISTORY_WEIGHT = 20;

    private const PURCHASE_HISTORY_WEIGHT = 10;

    // エンゲージメント指標の重み
    private const LIKE_WEIGHT = 1.0;

    private const BOOKMARK_WEIGHT = 1.5;

    private const VIEW_WEIGHT = 0.5;

    private const ENGAGEMENT_DIVISOR = 3.0;

    /**
     * ハイブリッド推薦アルゴリズム（重み付けスコアリング）
     *
     * @param  Product  $product  現在の商品
     * @param  User|null  $user  ログインユーザー（nullの場合は未ログイン）
     * @param  int  $limit  取得件数
     */
    public function getRecommendedProducts(Product $product, ?User $user = null, int $limit = 4): Collection
    {
        // 候補商品を取得（現在の商品と非アクティブ商品を除外）
        $candidates = Product::where('id', '!=', $product->id)
            ->where('is_active', true)
            ->with(['images', 'tags'])
            ->withCount(['likes', 'bookmarks'])
            ->get();

        if ($candidates->isEmpty()) {
            return collect();
        }

        // 現在の商品のタグIDを取得
        $currentProductTagIds = $product->tags->pluck('id');

        // ユーザーの閲覧・購入履歴を取得
        $viewedProductIds = $this->getViewedProductIds($user, $product->id);
        $purchasedProductIds = $this->getPurchasedProductIds($user);

        // エンゲージメント指標の最大値を計算（正規化用）
        $maxMetrics = $this->calculateMaxMetrics($candidates);

        // 各商品にスコアを計算
        $scoredProducts = $candidates->map(function ($candidate) use (
            $currentProductTagIds,
            $viewedProductIds,
            $purchasedProductIds,
            $maxMetrics
        ) {
            $score = $this->calculateProductScore(
                $candidate,
                $currentProductTagIds,
                $viewedProductIds,
                $purchasedProductIds,
                $maxMetrics
            );

            return [
                'product' => $candidate,
                'score' => $score,
            ];
        });

        // スコアでソートして上位を取得
        return $scoredProducts
            ->sortByDesc('score')
            ->take($limit)
            ->pluck('product');
    }

    /**
     * ユーザーの閲覧履歴から商品IDを取得
     */
    private function getViewedProductIds(?User $user, int $excludeProductId): array
    {
        if (! $user) {
            return [];
        }

        return ProductView::where('user_id', $user->id)
            ->where('product_id', '!=', $excludeProductId)
            ->distinct()
            ->pluck('product_id')
            ->toArray();
    }

    /**
     * ユーザーの購入履歴から商品IDを取得
     */
    private function getPurchasedProductIds(?User $user): array
    {
        if (! $user) {
            return [];
        }

        return Order::where('user_id', $user->id)
            ->where('status', 'completed')
            ->with('items')
            ->get()
            ->flatMap(fn ($order) => $order->items->pluck('product_id'))
            ->unique()
            ->toArray();
    }

    /**
     * エンゲージメント指標の最大値を計算
     */
    private function calculateMaxMetrics($candidates): array
    {
        return [
            'likes' => max(1, $candidates->max('likes_count') ?? 0),
            'bookmarks' => max(1, $candidates->max('bookmarks_count') ?? 0),
            'views' => max(1, $candidates->max('views') ?? 0),
        ];
    }

    /**
     * 商品のスコアを計算
     */
    private function calculateProductScore(
        Product $candidate,
        $currentProductTagIds,
        array $viewedProductIds,
        array $purchasedProductIds,
        array $maxMetrics
    ): float {
        $score = 0;

        // 1. タグ類似度（重み: 40%）
        $score += $this->calculateTagSimilarityScore($candidate, $currentProductTagIds);

        // 2. エンゲージメント指標（重み: 30%）
        $score += $this->calculateEngagementScore($candidate, $maxMetrics);

        // 3. 閲覧履歴ベース（重み: 20%）
        if (in_array($candidate->id, $viewedProductIds)) {
            $score += self::VIEW_HISTORY_WEIGHT;
        }

        // 4. 購入履歴ベース（重み: 10%）
        if (in_array($candidate->id, $purchasedProductIds)) {
            $score += self::PURCHASE_HISTORY_WEIGHT;
        }

        return $score;
    }

    /**
     * タグ類似度スコアを計算
     */
    private function calculateTagSimilarityScore(Product $candidate, $currentProductTagIds): float
    {
        $candidateTagIds = $candidate->tags->pluck('id');
        $commonTags = $currentProductTagIds->intersect($candidateTagIds)->count();
        $totalTags = $currentProductTagIds->count() + $candidateTagIds->count() - $commonTags;
        $tagSimilarity = $totalTags > 0 ? ($commonTags / $totalTags) : 0;

        return $tagSimilarity * self::TAG_SIMILARITY_WEIGHT;
    }

    /**
     * エンゲージメントスコアを計算
     */
    private function calculateEngagementScore(Product $candidate, array $maxMetrics): float
    {
        $normalizedLikes = $maxMetrics['likes'] > 0
            ? min(1, $candidate->likes_count / $maxMetrics['likes'])
            : 0;
        $normalizedBookmarks = $maxMetrics['bookmarks'] > 0
            ? min(1, $candidate->bookmarks_count / $maxMetrics['bookmarks'])
            : 0;
        $normalizedViews = $maxMetrics['views'] > 0
            ? min(1, $candidate->views / $maxMetrics['views'])
            : 0;

        $engagementScore = (
            $normalizedLikes * self::LIKE_WEIGHT +
            $normalizedBookmarks * self::BOOKMARK_WEIGHT +
            $normalizedViews * self::VIEW_WEIGHT
        ) / self::ENGAGEMENT_DIVISOR;

        return $engagementScore * self::ENGAGEMENT_WEIGHT;
    }
}

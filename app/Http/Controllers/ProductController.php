<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProductStoreRequest;
use App\Http\Requests\ProductUpdateRequest;
use App\Models\Bookmark;
use App\Models\Like;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductView;
use App\Models\Tag;
use App\Models\User;
use App\Services\ImageService;
use App\Services\ProductService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
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
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $query = Product::with(['user', 'images', 'tags'])
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('created_at', 'desc');

        // If admin, show all products (including inactive) when viewing own products
        $isAdminViewingOwn = Auth::check() && Auth::user()->isAdmin() && $request->has('my_products');
        
        if ($isAdminViewingOwn) {
            $query = Product::with(['user', 'images', 'tags'])
                ->where('user_id', Auth::id())
                ->orderBy('sort_order')
                ->orderBy('created_at', 'desc');
        }

        if ($request->has('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('title', 'like', '%' . $request->search . '%')
                    ->orWhere('description', 'like', '%' . $request->search . '%')
                    ->orWhereHas('tags', function ($tagQuery) use ($request) {
                        $tagQuery->where('name', 'like', '%' . $request->search . '%');
                    });
            });
        }

        if ($request->has('tag')) {
            $query->whereHas('tags', function ($q) use ($request) {
                $q->where('slug', $request->tag);
            });
        }

        $products = $query->paginate(12);

        return Inertia::render('Products/Index', [
            'products' => $products,
            'filters' => $request->only(['search', 'tag', 'my_products']),
            'isAdminViewingOwn' => $isAdminViewingOwn,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        $user = Auth::user();
        
        if (!$user->isAdmin()) {
            // アクセス拒否は警告ログに記録（セキュリティ監査用）
            if (config('app.debug')) {
                Log::warning('ProductController::create - Access denied', [
                    'user_id' => $user->id,
                ]);
            }
            abort(403, '管理者のみが商品を投稿できます。');
        }

        // タグ一覧をキャッシュ（1時間）
        $tags = Cache::remember('tags.all', 3600, function () {
            return Tag::all();
        });
        
        return Inertia::render('Products/Create', [
            'tags' => $tags,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(ProductStoreRequest $request, ProductService $productService)
    {
        $validated = $request->validated();

        $product = $productService->createProduct(
            [
                'user_id' => Auth::id(),
                'title' => $validated['title'],
                'description' => $validated['description'] ?? null,
                'price' => $validated['price'],
                'sort_order' => 0,
            ],
            $request->file('images'),
            $validated['tags'] ?? null,
            $validated['tag_names'] ?? null
        );

        return redirect()->route('products.show', $product->id)
            ->with('success', '商品が作成されました。');
    }

    /**
     * Display the specified resource.
     */
    public function show(Product $product, Request $request): Response
    {
        $product->load(['user', 'images', 'tags']);
        $product->increment('views');

        // 閲覧履歴を記録（ログインユーザーのみ、重複チェック）
        if (Auth::check()) {
            // 同じ商品を最近（1時間以内）見た場合は記録しない
            $recentView = ProductView::where('user_id', Auth::id())
                ->where('product_id', $product->id)
                ->where('viewed_at', '>', now()->subHour())
                ->exists();

            if (!$recentView) {
                ProductView::create([
                    'user_id' => Auth::id(),
                    'product_id' => $product->id,
                    'viewed_at' => now(),
                    'ip_address' => $request->ip(),
                ]);
            }
        } else {
            // 未ログインユーザーもIPアドレスで記録（重複チェック）
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

        // いいね・ブックマークの状態を取得（最適化：withCountを使用してカウントを1クエリで取得）
        $product->loadCount(['likes', 'bookmarks']);
        
        $likeCount = $product->likes_count;
        $bookmarkCount = $product->bookmarks_count;
        $isLiked = false;
        $isBookmarked = false;

        if (Auth::check()) {
            // ユーザーのいいね・ブックマーク状態を取得
            // インデックスが効くため、個別クエリでも高速
            $isLiked = Like::where('user_id', Auth::id())
                ->where('product_id', $product->id)
                ->exists();
            $isBookmarked = Bookmark::where('user_id', Auth::id())
                ->where('product_id', $product->id)
                ->exists();
        }

        // ハイブリッド推薦アルゴリズム（重み付けスコアリング）
        $relatedProducts = $this->getRecommendedProducts($product, Auth::user());

        return Inertia::render('Products/Show', [
            'product' => $product,
            'relatedProducts' => $relatedProducts,
            'isLiked' => $isLiked,
            'isBookmarked' => $isBookmarked,
            'likeCount' => $likeCount,
            'bookmarkCount' => $bookmarkCount,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Product $product): Response
    {
        $this->authorize('update', $product);
        
        $product->load(['images', 'tags']);
        $tags = Tag::all();

        return Inertia::render('Products/Edit', [
            'product' => $product,
            'tags' => $tags,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(ProductUpdateRequest $request, Product $product, ProductService $productService)
    {
        // Quick update for is_active toggle
        if ($request->has('is_active') || $request->has('data.is_active')) {
            $isActive = $request->has('is_active') 
                ? $request->boolean('is_active')
                : $request->boolean('data.is_active');
            $product->update([
                'is_active' => $isActive,
            ]);
            return back()->with('success', '商品のステータスが更新されました。');
        }

        // デバッグログは開発環境のみ（本番環境ではパフォーマンスに影響するため）
        if (config('app.debug')) {
            Log::debug('ProductController::update - Request received', [
                'product_id' => $product->id,
                'has_images' => $request->hasFile('images'),
                'images_count' => $request->hasFile('images') ? count($request->file('images')) : 0,
            ]);
        }

        $validated = $request->validated();
        
        $product = $productService->updateProduct(
            $product,
            [
                'title' => $validated['title'],
                'description' => $validated['description'] ?? null,
                'price' => $validated['price'],
            ],
            $request->hasFile('images') ? $request->file('images') : null,
            $validated['combined_order'] ?? null,
            $validated['tags'] ?? null,
            $validated['tag_names'] ?? null
        );

        return redirect()->route('products.show', $product->id)
            ->with('success', '商品が更新されました。');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Product $product, ProductService $productService)
    {
        $this->authorize('delete', $product);

        $productService->deleteProduct($product);

        return redirect()->route('products.index')
            ->with('success', '商品が削除されました。');
    }


    /**
     * Display my products (admin only)
     */
    public function myProducts(Request $request): Response
    {
        $user = Auth::user();
        
        if (!$user->isAdmin()) {
            // アクセス拒否は警告ログに記録（セキュリティ監査用）
            if (config('app.debug')) {
                Log::warning('ProductController::myProducts - Access denied', [
                    'user_id' => $user->id,
                ]);
            }
            abort(403);
        }

        $query = Product::with(['user', 'images', 'tags'])
            ->where('user_id', Auth::id())
            ->orderBy('sort_order')
            ->orderBy('created_at', 'desc');

        if ($request->has('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('title', 'like', '%' . $request->search . '%')
                    ->orWhere('description', 'like', '%' . $request->search . '%')
                    ->orWhereHas('tags', function ($tagQuery) use ($request) {
                        $tagQuery->where('name', 'like', '%' . $request->search . '%');
                    });
            });
        }

        $products = $query->paginate(20);

        return Inertia::render('Products/MyProducts', [
            'products' => $products,
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Update sort order of products
     */
    public function updateSortOrder(Request $request)
    {
        $request->validate([
            'products' => 'required|array',
            'products.*.id' => 'required|exists:products,id',
            'products.*.sort_order' => 'required|integer',
        ]);

        foreach ($request->products as $item) {
            Product::where('id', $item['id'])
                ->where('user_id', Auth::id())
                ->update(['sort_order' => $item['sort_order']]);
        }

        return response()->json(['success' => true]);
    }

    /**
     * ハイブリッド推薦アルゴリズム（重み付けスコアリング）
     * 
     * @param Product $product 現在の商品
     * @param User|null $user ログインユーザー（nullの場合は未ログイン）
     * @return \Illuminate\Database\Eloquent\Collection
     */
    private function getRecommendedProducts(Product $product, ?User $user = null)
    {
        // 候補商品を取得（現在の商品と非アクティブ商品を除外）
        $candidates = Product::where('id', '!=', $product->id)
            ->where('is_active', true)
            ->with(['images', 'tags'])
            ->withCount(['likes', 'bookmarks'])
            ->get();

        // 現在の商品のタグIDを取得
        $currentProductTagIds = $product->tags->pluck('id');

        // ユーザーの閲覧履歴から商品IDを取得
        $viewedProductIds = [];
        if ($user) {
            $viewedProductIds = ProductView::where('user_id', $user->id)
                ->where('product_id', '!=', $product->id)
                ->distinct()
                ->pluck('product_id')
                ->toArray();
        }

        // ユーザーの購入履歴から商品IDを取得
        $purchasedProductIds = [];
        if ($user) {
            $purchasedProductIds = Order::where('user_id', $user->id)
                ->where('status', 'completed')
                ->with('items')
                ->get()
                ->flatMap(function ($order) {
                    return $order->items->pluck('product_id');
                })
                ->unique()
                ->toArray();
        }

        // エンゲージメント指標の最大値を計算（正規化用）
        $maxLikes = max(1, $candidates->max('likes_count') ?: 0);
        $maxBookmarks = max(1, $candidates->max('bookmarks_count') ?: 0);
        $maxViews = max(1, $candidates->max('views') ?: 0);

        // 各商品にスコアを計算
        $scoredProducts = $candidates->map(function ($candidate) use (
            $currentProductTagIds,
            $viewedProductIds,
            $purchasedProductIds,
            $maxLikes,
            $maxBookmarks,
            $maxViews
        ) {
            $score = 0;

            // 1. タグ類似度（重み: 40%）
            $candidateTagIds = $candidate->tags->pluck('id');
            $commonTags = $currentProductTagIds->intersect($candidateTagIds)->count();
            $totalTags = $currentProductTagIds->count() + $candidateTagIds->count() - $commonTags;
            $tagSimilarity = $totalTags > 0 ? ($commonTags / $totalTags) : 0;
            $score += $tagSimilarity * self::TAG_SIMILARITY_WEIGHT;

            // 2. エンゲージメント指標（重み: 30%）
            $likeCount = $candidate->likes_count;
            $bookmarkCount = $candidate->bookmarks_count;
            $views = $candidate->views;

            // 正規化（0-1の範囲に）
            $normalizedLikes = $maxLikes > 0 ? min(1, $likeCount / $maxLikes) : 0;
            $normalizedBookmarks = $maxBookmarks > 0 ? min(1, $bookmarkCount / $maxBookmarks) : 0;
            $normalizedViews = $maxViews > 0 ? min(1, $views / $maxViews) : 0;

            // 重み付け平均
            $engagementScore = (
                $normalizedLikes * self::LIKE_WEIGHT +
                $normalizedBookmarks * self::BOOKMARK_WEIGHT +
                $normalizedViews * self::VIEW_WEIGHT
            ) / self::ENGAGEMENT_DIVISOR;
            $score += $engagementScore * self::ENGAGEMENT_WEIGHT;

            // 3. 閲覧履歴ベース（重み: 20%）
            if (in_array($candidate->id, $viewedProductIds)) {
                $score += self::VIEW_HISTORY_WEIGHT;
            }

            // 4. 購入履歴ベース（重み: 10%）
            if (in_array($candidate->id, $purchasedProductIds)) {
                $score += self::PURCHASE_HISTORY_WEIGHT;
            }

            return [
                'product' => $candidate,
                'score' => $score,
            ];
        });

        // スコアでソートして上位4件を取得
        return $scoredProducts
            ->sortByDesc('score')
            ->take(4)
            ->pluck('product');
    }
}

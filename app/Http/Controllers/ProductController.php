<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProductStoreRequest;
use App\Http\Requests\ProductUpdateRequest;
use App\Models\Bookmark;
use App\Models\Like;
use App\Models\Product;
use App\Models\Tag;
use App\Services\EngagementService;
use App\Services\ProductService;
use App\Services\ProductViewService;
use App\Services\RecommendationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function __construct(
        private readonly ProductService $productService,
        private readonly RecommendationService $recommendationService,
        private readonly ProductViewService $productViewService,
        private readonly EngagementService $engagementService
    ) {}

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
            if (config('app.debug')) {
                Log::warning('ProductController::create - Access denied', ['user_id' => $user->id]);
            }
            abort(403, '管理者のみが商品を投稿できます。');
        }

        $tags = Cache::remember('tags.all', 3600, fn() => Tag::all());

        return Inertia::render('Products/Create', [
            'tags' => $tags,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(ProductStoreRequest $request)
    {
        $validated = $request->validated();

        $product = $this->productService->createProduct(
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

        // 閲覧記録
        $this->productViewService->recordView($product, Auth::user(), $request);

        // いいね・ブックマークの状態を取得
        $product->loadCount(['likes', 'bookmarks']);

        $likeStatus = $this->engagementService->getLikeStatus($product, Auth::user());
        $bookmarkStatus = $this->engagementService->getBookmarkStatus($product, Auth::user());

        // 推薦商品
        $relatedProducts = $this->recommendationService->getRecommendedProducts($product, Auth::user());

        return Inertia::render('Products/Show', [
            'product' => $product,
            'relatedProducts' => $relatedProducts,
            'isLiked' => $likeStatus['is_liked'],
            'isBookmarked' => $bookmarkStatus['is_bookmarked'],
            'likeCount' => $product->likes_count,
            'bookmarkCount' => $product->bookmarks_count,
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
    public function update(ProductUpdateRequest $request, Product $product)
    {
        // Quick update for is_active toggle
        if ($request->has('is_active') || $request->has('data.is_active')) {
            $isActive = $request->has('is_active')
                ? $request->boolean('is_active')
                : $request->boolean('data.is_active');
            $product->update(['is_active' => $isActive]);
            return back()->with('success', '商品のステータスが更新されました。');
        }

        if (config('app.debug')) {
            Log::debug('ProductController::update - Request received', [
                'product_id' => $product->id,
                'has_images' => $request->hasFile('images'),
                'images_count' => $request->hasFile('images') ? count($request->file('images')) : 0,
            ]);
        }

        $validated = $request->validated();

        $product = $this->productService->updateProduct(
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
    public function destroy(Product $product)
    {
        $this->authorize('delete', $product);

        $this->productService->deleteProduct($product);

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
            if (config('app.debug')) {
                Log::warning('ProductController::myProducts - Access denied', ['user_id' => $user->id]);
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
}

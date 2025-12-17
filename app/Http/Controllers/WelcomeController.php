<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Tag;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class WelcomeController extends Controller
{
    /**
     * Display the welcome page
     */
    public function index(): Response
    {
        // 人気商品を取得（いいね数、ブックマーク数、閲覧数、販売数でソート）
        $popularProducts = Product::with(['user:id,name,username', 'images', 'tags'])
            ->where('is_active', true)
            ->withCount(['likes', 'bookmarks', 'productViews'])
            ->orderByRaw('(likes_count * 1.0 + bookmarks_count * 1.5 + product_views_count * 0.5 + sales_count * 2.0) DESC')
            ->limit(12)
            ->get();

        // 新着商品を取得
        $newProducts = Product::with(['user:id,name,username', 'images', 'tags'])
            ->where('is_active', true)
            ->orderBy('created_at', 'desc')
            ->limit(12)
            ->get();

        // 人気タグを取得（キャッシュ）
        // SQLiteではHAVING句を使う前にGROUP BYが必要なため、whereHasを使用
        $popularTags = Cache::remember('popular_tags', 3600, function () {
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

        return Inertia::render('Welcome', [
            'canLogin' => Route::has('login'),
            'canRegister' => Route::has('register'),
            'popularProducts' => $popularProducts,
            'newProducts' => $newProducts,
            'popularTags' => $popularTags,
        ]);
    }
}


<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Tag;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SearchController extends Controller
{
    /**
     * Search products, users, and tags
     */
    public function index(Request $request): Response
    {
        // 検索クエリをサニタイズ（SQLインジェクション対策）
        $query = trim($request->get('q', ''));
        $query = strip_tags($query); // HTMLタグを除去
        $query = mb_substr($query, 0, 100); // 最大100文字に制限
        
        $type = $request->get('type', 'all'); // all, products, users, tags

        $results = [
            'products' => collect(),
            'users' => collect(),
            'tags' => collect(),
        ];

        // 空のクエリの場合は早期リターン
        if (empty($query)) {
            return Inertia::render('Search/Index', [
                'query' => '',
                'type' => $type,
                'results' => $results,
            ]);
        }

        if ($type === 'all' || $type === 'products') {
            $results['products'] = Product::with(['user', 'images', 'tags'])
                ->where('is_active', true)
                ->where(function ($q) use ($query) {
                    $q->where('title', 'like', '%' . $query . '%')
                        ->orWhere('description', 'like', '%' . $query . '%')
                        ->orWhereHas('tags', function ($tagQuery) use ($query) {
                            $tagQuery->where('name', 'like', '%' . $query . '%');
                        });
                })
                ->orderBy('created_at', 'desc')
                ->limit(20)
                ->get();
        }

        if ($type === 'all' || $type === 'users') {
            $results['users'] = User::where(function ($q) use ($query) {
                    $q->where('name', 'like', '%' . $query . '%')
                      ->orWhere('username', 'like', '%' . $query . '%');
                })
                ->limit(10)
                ->get();
        }

        if ($type === 'all' || $type === 'tags') {
            $results['tags'] = Tag::where('name', 'like', '%' . $query . '%')
                ->limit(10)
                ->get();
        }

        return Inertia::render('Search/Index', [
            'query' => $query,
            'type' => $type,
            'results' => $results,
        ]);
    }
}

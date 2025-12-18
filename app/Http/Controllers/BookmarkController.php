<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Services\EngagementService;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class BookmarkController extends Controller
{
    public function __construct(
        private readonly EngagementService $engagementService
    ) {}

    /**
     * Toggle bookmark for a product
     */
    public function toggle(Product $product)
    {
        if (! Auth::check()) {
            return back()->with('error', 'ブックマークするにはログインが必要です。');
        }

        $result = $this->engagementService->toggleBookmark($product, Auth::user());

        if (! $result['success']) {
            return response()->json(['error' => $result['error']], 429);
        }

        return response()->json([
            'is_bookmarked' => $result['is_bookmarked'],
            'bookmark_count' => $result['bookmark_count'],
        ]);
    }

    /**
     * Get bookmark status for a product
     */
    public function status(Product $product)
    {
        $result = $this->engagementService->getBookmarkStatus($product, Auth::user());

        return response()->json($result);
    }

    /**
     * Display a listing of bookmarks
     */
    public function index()
    {
        $bookmarks = $this->engagementService->getUserBookmarks(Auth::user());

        return Inertia::render('Bookmarks/Index', [
            'bookmarks' => $bookmarks,
        ]);
    }
}

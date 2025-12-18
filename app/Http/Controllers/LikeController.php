<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Services\EngagementService;
use Illuminate\Support\Facades\Auth;

class LikeController extends Controller
{
    public function __construct(
        private readonly EngagementService $engagementService
    ) {}

    /**
     * Toggle like for a product
     */
    public function toggle(Product $product)
    {
        if (! Auth::check()) {
            return back()->with('error', 'いいねするにはログインが必要です。');
        }

        $result = $this->engagementService->toggleLike($product, Auth::user());

        if (! $result['success']) {
            return response()->json(['error' => $result['error']], 429);
        }

        return response()->json([
            'is_liked' => $result['is_liked'],
            'like_count' => $result['like_count'],
        ]);
    }

    /**
     * Get like status for a product
     */
    public function status(Product $product)
    {
        $result = $this->engagementService->getLikeStatus($product, Auth::user());

        return response()->json($result);
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class CartController extends Controller
{
    /**
     * Display the cart
     */
    public function index(): Response
    {
        $cartItems = CartItem::with(['product.images', 'product.user'])
            ->where('user_id', Auth::id())
            ->get();

        $total = $cartItems->sum(function ($item) {
            return $item->product->price;
        });

        return Inertia::render('Cart/Index', [
            'cartItems' => $cartItems,
            'total' => $total,
        ]);
    }

    /**
     * Add product to cart
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'product_id' => 'required|exists:products,id',
            ]);

            $product = Product::findOrFail($validated['product_id']);

            // 商品がアクティブかチェック
            if (!$product->is_active) {
                return back()->with('error', 'この商品は現在販売されていません。');
            }

            // 自分の商品をカートに追加できないようにする
            if ($product->user_id === Auth::id()) {
                return back()->with('error', '自分の商品をカートに追加することはできません。');
            }

            // Check if already in cart
            $existingItem = CartItem::where('user_id', Auth::id())
                ->where('product_id', $product->id)
                ->first();

            if ($existingItem) {
                return back()->with('warning', 'この商品は既にカートに追加されています。');
            }

            CartItem::create([
                'user_id' => Auth::id(),
                'product_id' => $product->id,
            ]);

            return back()->with('success', 'カートに追加されました。');
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return back()->with('error', '商品が見つかりませんでした。');
        } catch (\Exception $e) {
            Log::error('Cart store error', [
                'user_id' => Auth::id(),
                'product_id' => $request->input('product_id'),
                'error' => $e->getMessage(),
            ]);
            
            return back()->with('error', 'カートへの追加に失敗しました。しばらくしてから再度お試しください。');
        }
    }

    /**
     * Remove product from cart
     */
    public function destroy(CartItem $cartItem)
    {
        if ($cartItem->user_id !== Auth::id()) {
            abort(403);
        }

        $cartItem->delete();

        return back()->with('success', 'カートから削除されました。');
    }

    /**
     * Clear cart
     */
    public function clear()
    {
        CartItem::where('user_id', Auth::id())->delete();

        return back()->with('success', 'カートが空になりました。');
    }
}

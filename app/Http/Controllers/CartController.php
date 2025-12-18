<?php

namespace App\Http\Controllers;

use App\Models\CartItem;
use App\Services\CartService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class CartController extends Controller
{
    public function __construct(
        private readonly CartService $cartService
    ) {}

    /**
     * Display the cart
     */
    public function index(): Response
    {
        $cartItems = $this->cartService->getCartItems();
        $total = $this->cartService->getCartTotal($cartItems);

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

            $result = $this->cartService->addToCart($validated['product_id']);

            return back()->with($result['type'], $result['message']);
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

        $this->cartService->removeFromCart($cartItem);

        return back()->with('success', 'カートから削除されました。');
    }

    /**
     * Clear cart
     */
    public function clear()
    {
        $this->cartService->clearCart();

        return back()->with('success', 'カートが空になりました。');
    }
}

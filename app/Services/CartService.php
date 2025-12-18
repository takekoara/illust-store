<?php

namespace App\Services;

use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class CartService
{
    /**
     * Get cart items for the current user
     */
    public function getCartItems()
    {
        return CartItem::with(['product.images', 'product.user'])
            ->where('user_id', Auth::id())
            ->get();
    }

    /**
     * Calculate cart total
     */
    public function getCartTotal($cartItems = null)
    {
        $items = $cartItems ?? $this->getCartItems();
        
        return $items->sum(function ($item) {
            return $item->product->price;
        });
    }

    /**
     * Add product to cart
     * 
     * @throws \Exception
     */
    public function addToCart(int $productId): array
    {
        $product = Product::findOrFail($productId);

        // 商品がアクティブかチェック
        if (!$product->is_active) {
            return [
                'success' => false,
                'type' => 'error',
                'message' => 'この商品は現在販売されていません。',
            ];
        }

        // 自分の商品をカートに追加できないようにする
        if ($product->user_id === Auth::id()) {
            return [
                'success' => false,
                'type' => 'error',
                'message' => '自分の商品をカートに追加することはできません。',
            ];
        }

        // 既にカートにあるかチェック
        $existingItem = CartItem::where('user_id', Auth::id())
            ->where('product_id', $product->id)
            ->exists();

        if ($existingItem) {
            return [
                'success' => false,
                'type' => 'warning',
                'message' => 'この商品は既にカートに追加されています。',
            ];
        }

        CartItem::create([
            'user_id' => Auth::id(),
            'product_id' => $product->id,
        ]);

        return [
            'success' => true,
            'type' => 'success',
            'message' => 'カートに追加されました。',
        ];
    }

    /**
     * Remove item from cart
     */
    public function removeFromCart(CartItem $cartItem): bool
    {
        if ($cartItem->user_id !== Auth::id()) {
            return false;
        }

        return $cartItem->delete();
    }

    /**
     * Clear all cart items for the current user
     */
    public function clearCart(): int
    {
        return CartItem::where('user_id', Auth::id())->delete();
    }

    /**
     * Validate cart items for checkout
     */
    public function validateForCheckout($cartItems = null): array
    {
        $items = $cartItems ?? $this->getCartItems();

        if ($items->isEmpty()) {
            return [
                'valid' => false,
                'message' => 'カートが空です。',
            ];
        }

        $invalidItems = $items->filter(function ($item) {
            return !$item->product || !$item->product->is_active || $item->product->price <= 0;
        });

        if ($invalidItems->isNotEmpty()) {
            return [
                'valid' => false,
                'message' => 'カートに無効な商品が含まれています。カートを確認してください。',
                'invalidItems' => $invalidItems->pluck('id')->toArray(),
            ];
        }

        $total = $this->getCartTotal($items);
        if ($total <= 0) {
            return [
                'valid' => false,
                'message' => '注文金額が無効です。商品を確認してください。',
            ];
        }

        return [
            'valid' => true,
            'items' => $items,
            'total' => $total,
        ];
    }
}


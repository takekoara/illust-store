<?php

namespace Tests\Feature;

use App\Models\CartItem;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CartControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    private User $admin;

    private Product $product;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
        $this->admin = User::factory()->create(['is_admin' => true]);
        $this->product = Product::factory()->create([
            'user_id' => $this->admin->id,
            'is_active' => true,
        ]);
    }

    public function test_guest_cannot_access_cart(): void
    {
        $response = $this->get(route('cart.index'));
        $response->assertRedirect(route('login'));
    }

    public function test_user_can_view_empty_cart(): void
    {
        $response = $this->actingAs($this->user)->get(route('cart.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Cart/Index')
            ->has('cartItems', 0)
            ->where('total', 0)
        );
    }

    public function test_user_can_view_cart_with_items(): void
    {
        // Arrange
        CartItem::factory()->create([
            'user_id' => $this->user->id,
            'product_id' => $this->product->id,
        ]);

        // Act
        $response = $this->actingAs($this->user)->get(route('cart.index'));

        // Assert
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Cart/Index')
            ->has('cartItems', 1)
        );
    }

    public function test_user_can_add_product_to_cart(): void
    {
        $response = $this->actingAs($this->user)->post(route('cart.store'), [
            'product_id' => $this->product->id,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('cart_items', [
            'user_id' => $this->user->id,
            'product_id' => $this->product->id,
        ]);
    }

    public function test_user_cannot_add_same_product_twice(): void
    {
        // Arrange
        CartItem::factory()->create([
            'user_id' => $this->user->id,
            'product_id' => $this->product->id,
        ]);

        // Act
        $response = $this->actingAs($this->user)->post(route('cart.store'), [
            'product_id' => $this->product->id,
        ]);

        // Assert
        $response->assertRedirect();
        $this->assertDatabaseCount('cart_items', 1);
    }

    public function test_user_cannot_add_own_product_to_cart(): void
    {
        // Arrange
        $userProduct = Product::factory()->create([
            'user_id' => $this->user->id,
            'is_active' => true,
        ]);

        // Act
        $response = $this->actingAs($this->user)->post(route('cart.store'), [
            'product_id' => $userProduct->id,
        ]);

        // Assert
        $response->assertRedirect();
        $this->assertDatabaseMissing('cart_items', [
            'user_id' => $this->user->id,
            'product_id' => $userProduct->id,
        ]);
    }

    public function test_user_cannot_add_inactive_product_to_cart(): void
    {
        // Arrange
        $inactiveProduct = Product::factory()->create([
            'user_id' => $this->admin->id,
            'is_active' => false,
        ]);

        // Act
        $response = $this->actingAs($this->user)->post(route('cart.store'), [
            'product_id' => $inactiveProduct->id,
        ]);

        // Assert
        $response->assertRedirect();
        $this->assertDatabaseMissing('cart_items', [
            'user_id' => $this->user->id,
            'product_id' => $inactiveProduct->id,
        ]);
    }

    public function test_user_can_remove_item_from_cart(): void
    {
        // Arrange
        $cartItem = CartItem::factory()->create([
            'user_id' => $this->user->id,
            'product_id' => $this->product->id,
        ]);

        // Act
        $response = $this->actingAs($this->user)->delete(route('cart.destroy', $cartItem));

        // Assert
        $response->assertRedirect();
        $this->assertDatabaseMissing('cart_items', [
            'id' => $cartItem->id,
        ]);
    }

    public function test_user_cannot_remove_other_users_cart_item(): void
    {
        // Arrange
        $otherUser = User::factory()->create();
        $cartItem = CartItem::factory()->create([
            'user_id' => $otherUser->id,
            'product_id' => $this->product->id,
        ]);

        // Act
        $response = $this->actingAs($this->user)->delete(route('cart.destroy', $cartItem));

        // Assert
        $response->assertStatus(403);
        $this->assertDatabaseHas('cart_items', [
            'id' => $cartItem->id,
        ]);
    }

    public function test_user_can_clear_cart(): void
    {
        // Arrange
        CartItem::factory()->count(3)->create([
            'user_id' => $this->user->id,
        ]);

        // Act
        $response = $this->actingAs($this->user)->delete(route('cart.clear'));

        // Assert
        $response->assertRedirect();
        $this->assertDatabaseCount('cart_items', 0);
    }

    public function test_clear_cart_only_removes_current_users_items(): void
    {
        // Arrange
        $otherUser = User::factory()->create();
        CartItem::factory()->count(2)->create(['user_id' => $this->user->id]);
        CartItem::factory()->count(3)->create(['user_id' => $otherUser->id]);

        // Act
        $response = $this->actingAs($this->user)->delete(route('cart.clear'));

        // Assert
        $response->assertRedirect();
        $this->assertDatabaseCount('cart_items', 3); // Other user's items remain
    }

    public function test_cart_total_is_calculated_correctly(): void
    {
        // Arrange
        $product1 = Product::factory()->create([
            'user_id' => $this->admin->id,
            'price' => 1000,
            'is_active' => true,
        ]);
        $product2 = Product::factory()->create([
            'user_id' => $this->admin->id,
            'price' => 2500,
            'is_active' => true,
        ]);

        CartItem::factory()->create(['user_id' => $this->user->id, 'product_id' => $product1->id]);
        CartItem::factory()->create(['user_id' => $this->user->id, 'product_id' => $product2->id]);

        // Act
        $response = $this->actingAs($this->user)->get(route('cart.index'));

        // Assert
        $response->assertInertia(fn ($page) => $page
            ->where('total', 3500)
        );
    }
}

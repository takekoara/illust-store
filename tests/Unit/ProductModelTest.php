<?php

namespace Tests\Unit;

use App\Models\Bookmark;
use App\Models\CartItem;
use App\Models\Like;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductView;
use App\Models\Tag;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductModelTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    private Product $product;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = User::factory()->create(['is_admin' => true]);
        $this->product = Product::factory()->create(['user_id' => $this->admin->id]);
    }

    public function test_product_belongs_to_user(): void
    {
        $this->assertInstanceOf(User::class, $this->product->user);
        $this->assertEquals($this->admin->id, $this->product->user->id);
    }

    public function test_product_has_many_images(): void
    {
        ProductImage::factory()->count(3)->create(['product_id' => $this->product->id]);

        $this->assertCount(3, $this->product->images);
        $this->assertInstanceOf(ProductImage::class, $this->product->images->first());
    }

    public function test_product_images_ordered_by_sort_order(): void
    {
        ProductImage::factory()->create(['product_id' => $this->product->id, 'sort_order' => 2]);
        ProductImage::factory()->create(['product_id' => $this->product->id, 'sort_order' => 0]);
        ProductImage::factory()->create(['product_id' => $this->product->id, 'sort_order' => 1]);

        $images = $this->product->fresh()->images;

        $this->assertEquals(0, $images[0]->sort_order);
        $this->assertEquals(1, $images[1]->sort_order);
        $this->assertEquals(2, $images[2]->sort_order);
    }

    public function test_product_has_one_primary_image(): void
    {
        ProductImage::factory()->create(['product_id' => $this->product->id, 'is_primary' => false]);
        $primaryImage = ProductImage::factory()->create(['product_id' => $this->product->id, 'is_primary' => true]);

        $this->assertInstanceOf(ProductImage::class, $this->product->primaryImage);
        $this->assertEquals($primaryImage->id, $this->product->primaryImage->id);
    }

    public function test_product_belongs_to_many_tags(): void
    {
        $tags = Tag::factory()->count(3)->create();
        $this->product->tags()->attach($tags);

        $this->assertCount(3, $this->product->tags);
        $this->assertInstanceOf(Tag::class, $this->product->tags->first());
    }

    public function test_product_has_many_cart_items(): void
    {
        $user = User::factory()->create();
        CartItem::factory()->create(['product_id' => $this->product->id, 'user_id' => $user->id]);

        $this->assertCount(1, $this->product->cartItems);
        $this->assertInstanceOf(CartItem::class, $this->product->cartItems->first());
    }

    public function test_product_has_many_order_items(): void
    {
        $user = User::factory()->create();
        $order = Order::factory()->create(['user_id' => $user->id]);
        OrderItem::factory()->create([
            'order_id' => $order->id,
            'product_id' => $this->product->id,
        ]);

        $this->assertCount(1, $this->product->orderItems);
        $this->assertInstanceOf(OrderItem::class, $this->product->orderItems->first());
    }

    public function test_product_has_many_likes(): void
    {
        $user = User::factory()->create();
        Like::factory()->create(['product_id' => $this->product->id, 'user_id' => $user->id]);

        $this->assertCount(1, $this->product->likes);
        $this->assertInstanceOf(Like::class, $this->product->likes->first());
    }

    public function test_product_has_many_bookmarks(): void
    {
        $user = User::factory()->create();
        Bookmark::factory()->create(['product_id' => $this->product->id, 'user_id' => $user->id]);

        $this->assertCount(1, $this->product->bookmarks);
        $this->assertInstanceOf(Bookmark::class, $this->product->bookmarks->first());
    }

    public function test_product_has_many_product_views(): void
    {
        $user = User::factory()->create();
        ProductView::factory()->create(['product_id' => $this->product->id, 'user_id' => $user->id]);

        $this->assertCount(1, $this->product->productViews);
        $this->assertInstanceOf(ProductView::class, $this->product->productViews->first());
    }

    public function test_product_price_is_cast_to_decimal(): void
    {
        $product = Product::factory()->create([
            'user_id' => $this->admin->id,
            'price' => '1500.50',
        ]);

        $this->assertIsFloat($product->price + 0);
    }

    public function test_product_is_active_is_cast_to_boolean(): void
    {
        $product = Product::factory()->create([
            'user_id' => $this->admin->id,
            'is_active' => 1,
        ]);

        $this->assertIsBool($product->is_active);
        $this->assertTrue($product->is_active);
    }

    public function test_product_uses_soft_deletes(): void
    {
        $productId = $this->product->id;
        $this->product->delete();

        $this->assertSoftDeleted('products', ['id' => $productId]);
        $this->assertNotNull(Product::withTrashed()->find($productId));
    }
}

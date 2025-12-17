<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\ProductImage;
use App\Models\Tag;
use App\Models\User;
use App\Services\ImageService;
use App\Services\ProductService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ProductServiceTest extends TestCase
{
    use RefreshDatabase;

    protected ProductService $productService;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');
        $this->productService = app(ProductService::class);
    }

    public function test_can_create_product_with_images_and_tags(): void
    {
        $user = User::factory()->create(['is_admin' => true]);
        $tag = Tag::factory()->create();

        $image = UploadedFile::fake()->image('product.jpg', 1000, 1000);

        $product = $this->productService->createProduct(
            [
                'user_id' => $user->id,
                'title' => 'Test Product',
                'description' => 'Test Description',
                'price' => 1000,
            ],
            [$image],
            [$tag->id],
            null
        );

        $this->assertDatabaseHas('products', [
            'id' => $product->id,
            'title' => 'Test Product',
        ]);

        $this->assertCount(1, $product->images);
        $this->assertCount(1, $product->tags);
        Storage::disk('public')->assertExists($product->images->first()->image_path);
    }

    public function test_can_create_product_with_new_tags(): void
    {
        $user = User::factory()->create(['is_admin' => true]);
        $image = UploadedFile::fake()->image('product.jpg', 1000, 1000);

        $product = $this->productService->createProduct(
            [
                'user_id' => $user->id,
                'title' => 'Test Product',
                'price' => 1000,
            ],
            [$image],
            null,
            ['新規タグ1', '新規タグ2']
        );

        $this->assertCount(2, $product->tags);
        $this->assertTrue($product->tags->contains('name', '新規タグ1'));
    }

    public function test_can_update_product(): void
    {
        $user = User::factory()->create(['is_admin' => true]);
        $product = Product::factory()->create(['user_id' => $user->id]);
        $tag = Tag::factory()->create();
        $product->tags()->attach($tag);

        $updatedProduct = $this->productService->updateProduct(
            $product,
            ['title' => 'Updated Title'],
            null,
            null,
            [$tag->id],
            null
        );

        $this->assertEquals('Updated Title', $updatedProduct->title);
    }

    public function test_can_delete_product_with_images(): void
    {
        $user = User::factory()->create(['is_admin' => true]);
        $product = Product::factory()->create(['user_id' => $user->id]);
        $image = $product->images()->create([
            'image_path' => 'products/test.jpg',
            'thumbnail_path' => 'products/thumbnails/test_thumb.jpg',
            'sort_order' => 0,
            'is_primary' => true,
        ]);

        Storage::disk('public')->put('products/test.jpg', 'fake content');
        Storage::disk('public')->put('products/thumbnails/test_thumb.jpg', 'fake content');

        $result = $this->productService->deleteProduct($product);

        $this->assertTrue($result);
        $this->assertSoftDeleted('products', ['id' => $product->id]);
        Storage::disk('public')->assertMissing('products/test.jpg');
        Storage::disk('public')->assertMissing('products/thumbnails/test_thumb.jpg');
    }

    public function test_product_creation_uses_transaction(): void
    {
        $user = User::factory()->create(['is_admin' => true]);
        $image = UploadedFile::fake()->image('product.jpg', 1000, 1000);

        $product = $this->productService->createProduct(
            [
                'user_id' => $user->id,
                'title' => 'Test Product',
                'price' => 1000,
            ],
            [$image],
            null,
            null
        );

        $this->assertNotNull($product);
        $this->assertCount(1, $product->images);
    }

    public function test_can_create_product_without_tags(): void
    {
        $user = User::factory()->create(['is_admin' => true]);
        $image = UploadedFile::fake()->image('product.jpg', 1000, 1000);

        $product = $this->productService->createProduct(
            [
                'user_id' => $user->id,
                'title' => 'Test Product',
                'price' => 1000,
            ],
            [$image],
            null,  // $tagIdsが空
            null   // $tagNamesが空
        );

        // タグが紐付けられていないことを確認
        $this->assertCount(0, $product->tags);
    }
}

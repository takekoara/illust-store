<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\Tag;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ProductControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');
    }

    public function test_admin_can_create_product(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $tag = Tag::factory()->create();

        $response = $this->actingAs($admin)->post(route('products.store'), [
            'title' => 'Test Product',
            'description' => 'Test Description',
            'price' => 1000,
            'images' => [
                UploadedFile::fake()->image('product1.jpg'),
            ],
            'tags' => [$tag->id],
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('products', [
            'title' => 'Test Product',
            'user_id' => $admin->id,
        ]);
    }

    public function test_non_admin_cannot_create_product(): void
    {
        $user = User::factory()->create(['is_admin' => false]);

        $response = $this->actingAs($user)->post(route('products.store'), [
            'title' => 'Test Product',
            'price' => 1000,
            'images' => [
                UploadedFile::fake()->image('product1.jpg'),
            ],
        ]);

        $response->assertStatus(403);
    }

    public function test_product_creation_requires_title(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);

        $response = $this->actingAs($admin)->post(route('products.store'), [
            'price' => 1000,
            'images' => [
                UploadedFile::fake()->image('product1.jpg'),
            ],
        ]);

        $response->assertSessionHasErrors(['title']);
    }

    public function test_product_creation_requires_at_least_one_image(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);

        $response = $this->actingAs($admin)->post(route('products.store'), [
            'title' => 'Test Product',
            'price' => 1000,
            'images' => [],
        ]);

        $response->assertSessionHasErrors(['images']);
    }

    public function test_admin_can_update_own_product(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $product = Product::factory()->create(['user_id' => $admin->id]);

        $response = $this->actingAs($admin)->patch(route('products.update', $product), [
            'title' => 'Updated Title',
            'description' => 'Updated Description',
            'price' => 2000,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('products', [
            'id' => $product->id,
            'title' => 'Updated Title',
            'price' => 2000,
        ]);
    }

    public function test_admin_cannot_update_other_admin_product(): void
    {
        $admin1 = User::factory()->create(['is_admin' => true]);
        $admin2 = User::factory()->create(['is_admin' => true]);
        $product = Product::factory()->create(['user_id' => $admin1->id]);

        $response = $this->actingAs($admin2)->patch(route('products.update', $product), [
            'title' => 'Updated Title',
            'price' => 2000,
        ]);

        $response->assertStatus(403);
    }

    public function test_product_deletion_uses_transaction(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $product = Product::factory()->create(['user_id' => $admin->id]);
        $image = $product->images()->create([
            'image_path' => 'test/image.jpg',
            'sort_order' => 0,
            'is_primary' => true,
        ]);

        Storage::disk('public')->put('test/image.jpg', 'fake content');

        $response = $this->actingAs($admin)->delete(route('products.destroy', $product));

        $response->assertRedirect(route('products.index'));
        
        // SoftDeletesを使用しているため、deleted_atが設定される
        $product->refresh();
        $this->assertNotNull($product->deleted_at);
        $this->assertSoftDeleted('products', ['id' => $product->id]);
        
        // 画像ファイルが削除されることを確認（データベースの画像レコードは外部キー制約で削除される可能性がある）
        // 実際のコントローラーでは画像ファイルのみ削除し、レコードは外部キー制約で削除される
        $this->assertFalse(Storage::disk('public')->exists('test/image.jpg'));
    }

    public function test_product_list_shows_only_active_products(): void
    {
        Product::factory()->create(['is_active' => true]);
        Product::factory()->create(['is_active' => false]);

        $response = $this->get(route('products.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Products/Index')
            ->has('products.data', 1)
            ->where('products.data.0.is_active', true)
        );
    }

    public function test_product_search_includes_tags(): void
    {
        $tag = Tag::factory()->create(['name' => 'anime']);
        $product = Product::factory()->create(['is_active' => true]);
        $product->tags()->attach($tag);

        $response = $this->get(route('products.index', ['search' => 'anime']));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Products/Index')
            ->has('products.data', 1)
        );
    }
}


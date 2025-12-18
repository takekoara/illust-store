<?php

namespace Tests\Feature;

use App\Models\Bookmark;
use App\Models\Like;
use App\Models\Product;
use App\Models\ProductView;
use App\Models\Tag;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class WelcomeControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = User::factory()->create(['is_admin' => true]);
        Cache::forget('popular_tags');
    }

    public function test_welcome_page_is_accessible(): void
    {
        $response = $this->get(route('welcome'));
        
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Welcome')
        );
    }

    public function test_welcome_page_shows_popular_products(): void
    {
        // Arrange
        $popularProduct = Product::factory()->create([
            'user_id' => $this->admin->id,
            'is_active' => true,
            'sales_count' => 100,
        ]);
        
        // Add engagement to make it popular
        $users = User::factory()->count(5)->create();
        foreach ($users as $user) {
            Like::factory()->create(['user_id' => $user->id, 'product_id' => $popularProduct->id]);
        }

        // Act
        $response = $this->get(route('welcome'));

        // Assert
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->has('popularProducts')
        );
    }

    public function test_welcome_page_shows_new_products(): void
    {
        // Arrange
        Product::factory()->count(5)->create([
            'user_id' => $this->admin->id,
            'is_active' => true,
        ]);

        // Act
        $response = $this->get(route('welcome'));

        // Assert
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->has('newProducts', 5)
        );
    }

    public function test_welcome_page_excludes_inactive_products(): void
    {
        // Arrange
        Product::factory()->count(3)->create([
            'user_id' => $this->admin->id,
            'is_active' => true,
        ]);
        Product::factory()->count(2)->create([
            'user_id' => $this->admin->id,
            'is_active' => false,
        ]);

        // Act
        $response = $this->get(route('welcome'));

        // Assert
        $response->assertInertia(fn ($page) => $page
            ->has('newProducts', 3)
        );
    }

    public function test_welcome_page_shows_popular_tags(): void
    {
        // Arrange
        $tag1 = Tag::factory()->create(['name' => 'illustration']);
        $tag2 = Tag::factory()->create(['name' => 'digital_art']);
        
        $products = Product::factory()->count(5)->create([
            'user_id' => $this->admin->id,
            'is_active' => true,
        ]);
        
        foreach ($products as $product) {
            $product->tags()->attach($tag1);
        }
        $products->first()->tags()->attach($tag2);

        // Act
        $response = $this->get(route('welcome'));

        // Assert
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->has('popularTags')
        );
    }

    public function test_welcome_page_limits_products_to_12(): void
    {
        // Arrange
        Product::factory()->count(20)->create([
            'user_id' => $this->admin->id,
            'is_active' => true,
        ]);

        // Act
        $response = $this->get(route('welcome'));

        // Assert
        $response->assertInertia(fn ($page) => $page
            ->has('newProducts', 12)
            ->has('popularProducts', 12)
        );
    }

    public function test_popular_products_ordered_by_engagement_score(): void
    {
        // Arrange
        $lessPopular = Product::factory()->create([
            'user_id' => $this->admin->id,
            'is_active' => true,
            'sales_count' => 0,
        ]);
        
        $morePopular = Product::factory()->create([
            'user_id' => $this->admin->id,
            'is_active' => true,
            'sales_count' => 10,
        ]);

        // Add more engagement to morePopular
        $users = User::factory()->count(5)->create();
        foreach ($users as $user) {
            Like::factory()->create(['user_id' => $user->id, 'product_id' => $morePopular->id]);
            Bookmark::factory()->create(['user_id' => $user->id, 'product_id' => $morePopular->id]);
        }

        // Act
        $response = $this->get(route('welcome'));

        // Assert
        $response->assertInertia(fn ($page) => $page
            ->where('popularProducts.0.id', $morePopular->id)
        );
    }

    public function test_new_products_ordered_by_created_at_desc(): void
    {
        // Arrange
        $oldProduct = Product::factory()->create([
            'user_id' => $this->admin->id,
            'is_active' => true,
            'created_at' => now()->subDays(5),
        ]);
        
        $newProduct = Product::factory()->create([
            'user_id' => $this->admin->id,
            'is_active' => true,
            'created_at' => now(),
        ]);

        // Act
        $response = $this->get(route('welcome'));

        // Assert
        $response->assertInertia(fn ($page) => $page
            ->where('newProducts.0.id', $newProduct->id)
        );
    }

    public function test_welcome_page_shows_login_register_links(): void
    {
        $response = $this->get(route('welcome'));

        $response->assertInertia(fn ($page) => $page
            ->where('canLogin', true)
            ->where('canRegister', true)
        );
    }

    public function test_popular_tags_are_cached(): void
    {
        // Arrange
        $tag = Tag::factory()->create(['name' => 'illustration']);
        $product = Product::factory()->create([
            'user_id' => $this->admin->id,
            'is_active' => true,
        ]);
        $product->tags()->attach($tag);

        // Act - First request
        $this->get(route('welcome'));
        
        // Create more tags after cache
        Tag::factory()->create(['name' => 'new_tag']);
        
        // Act - Second request (should use cache)
        $response = $this->get(route('welcome'));

        // Assert - Should not include new_tag in cached results
        $response->assertInertia(fn ($page) => $page
            ->has('popularTags', 1)
        );
    }
}


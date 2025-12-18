<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\Tag;
use App\Models\User;
use App\Services\SearchService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SearchServiceTest extends TestCase
{
    use RefreshDatabase;

    private SearchService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = app(SearchService::class);
    }

    public function test_sanitize_query_trims_whitespace(): void
    {
        $result = $this->service->sanitizeQuery('  hello world  ');
        $this->assertEquals('hello world', $result);
    }

    public function test_sanitize_query_removes_html_tags(): void
    {
        $result = $this->service->sanitizeQuery('<script>alert("xss")</script>test');
        $this->assertEquals('alert("xss")test', $result);
    }

    public function test_sanitize_query_limits_length(): void
    {
        $longQuery = str_repeat('a', 150);
        $result = $this->service->sanitizeQuery($longQuery);
        $this->assertEquals(100, mb_strlen($result));
    }

    public function test_search_returns_empty_results_for_empty_query(): void
    {
        $results = $this->service->search('', 'all');

        $this->assertEmpty($results['products']);
        $this->assertEmpty($results['users']);
        $this->assertEmpty($results['tags']);
    }

    public function test_search_products_by_title(): void
    {
        // Arrange
        $admin = User::factory()->create(['is_admin' => true]);
        Product::factory()->create([
            'user_id' => $admin->id,
            'title' => 'Beautiful Illustration',
            'is_active' => true,
        ]);
        Product::factory()->create([
            'user_id' => $admin->id,
            'title' => 'Other Product',
            'is_active' => true,
        ]);

        // Act
        $results = $this->service->search('Beautiful', 'products');

        // Assert
        $this->assertCount(1, $results['products']);
        $this->assertEquals('Beautiful Illustration', $results['products']->first()->title);
    }

    public function test_search_products_by_description(): void
    {
        // Arrange
        $admin = User::factory()->create(['is_admin' => true]);
        Product::factory()->create([
            'user_id' => $admin->id,
            'title' => 'Product A',
            'description' => 'A wonderful landscape illustration',
            'is_active' => true,
        ]);

        // Act
        $results = $this->service->search('landscape', 'products');

        // Assert
        $this->assertCount(1, $results['products']);
    }

    public function test_search_excludes_inactive_products(): void
    {
        // Arrange
        $admin = User::factory()->create(['is_admin' => true]);
        Product::factory()->create([
            'user_id' => $admin->id,
            'title' => 'Active Product',
            'is_active' => true,
        ]);
        Product::factory()->create([
            'user_id' => $admin->id,
            'title' => 'Inactive Product',
            'is_active' => false,
        ]);

        // Act
        $results = $this->service->search('Product', 'products');

        // Assert
        $this->assertCount(1, $results['products']);
        $this->assertEquals('Active Product', $results['products']->first()->title);
    }

    public function test_search_products_by_tag(): void
    {
        // Arrange
        $admin = User::factory()->create(['is_admin' => true]);
        $tag = Tag::factory()->create(['name' => 'anime']);
        $product = Product::factory()->create([
            'user_id' => $admin->id,
            'title' => 'Some Product',
            'is_active' => true,
        ]);
        $product->tags()->attach($tag);

        // Act
        $results = $this->service->search('anime', 'products');

        // Assert
        $this->assertCount(1, $results['products']);
    }

    public function test_search_users_by_name(): void
    {
        // Arrange
        User::factory()->create(['name' => 'John Doe']);
        User::factory()->create(['name' => 'Jane Smith']);

        // Act
        $results = $this->service->search('John', 'users');

        // Assert
        $this->assertCount(1, $results['users']);
        $this->assertEquals('John Doe', $results['users']->first()->name);
    }

    public function test_search_users_by_username(): void
    {
        // Arrange
        User::factory()->create(['username' => 'artist_john']);
        User::factory()->create(['username' => 'designer_jane']);

        // Act
        $results = $this->service->search('artist', 'users');

        // Assert
        $this->assertCount(1, $results['users']);
        $this->assertEquals('artist_john', $results['users']->first()->username);
    }

    public function test_search_tags(): void
    {
        // Arrange
        Tag::factory()->create(['name' => 'illustration']);
        Tag::factory()->create(['name' => 'digital_art']);
        Tag::factory()->create(['name' => 'photography']);

        // Act
        $results = $this->service->search('illust', 'tags');

        // Assert
        $this->assertCount(1, $results['tags']);
        $this->assertEquals('illustration', $results['tags']->first()->name);
    }

    public function test_search_all_types(): void
    {
        // Arrange
        $admin = User::factory()->create(['is_admin' => true, 'name' => 'Test Artist']);
        Product::factory()->create([
            'user_id' => $admin->id,
            'title' => 'Test Product',
            'is_active' => true,
        ]);
        Tag::factory()->create(['name' => 'test_tag']);

        // Act
        $results = $this->service->search('test', 'all');

        // Assert
        $this->assertNotEmpty($results['products']);
        $this->assertNotEmpty($results['users']);
        $this->assertNotEmpty($results['tags']);
    }

    public function test_search_respects_limits(): void
    {
        // Arrange
        $admin = User::factory()->create(['is_admin' => true]);
        Product::factory()->count(25)->create([
            'user_id' => $admin->id,
            'title' => 'Test Product',
            'is_active' => true,
        ]);

        // Act
        $results = $this->service->search('Test', 'products');

        // Assert
        $this->assertCount(20, $results['products']); // PRODUCTS_LIMIT = 20
    }
}

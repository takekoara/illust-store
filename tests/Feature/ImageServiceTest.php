<?php

namespace Tests\Feature;

use App\Services\ImageService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ImageServiceTest extends TestCase
{
    use RefreshDatabase;

    protected ImageService $imageService;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');
        $this->imageService = app(ImageService::class);
    }

    public function test_can_process_product_image(): void
    {
        $image = UploadedFile::fake()->image('product.jpg', 2000, 2000);

        $result = $this->imageService->processProductImage($image, 'products', [
            'max_width' => 1920,
            'max_height' => 1920,
            'quality' => 85,
            'generate_thumbnail' => true,
        ]);

        // 正常系: 返り値がarrayであることを確認
        $this->assertIsArray($result);
        $this->assertArrayHasKey('path', $result);
        $this->assertArrayHasKey('thumbnail_path', $result);
        Storage::disk('public')->assertExists($result['path']);
        Storage::disk('public')->assertExists($result['thumbnail_path']);
    }

    public function test_can_delete_image_and_thumbnail(): void
    {
        Storage::disk('public')->put('products/test.jpg', 'fake content');
        Storage::disk('public')->put('products/thumbnails/test_thumb.jpg', 'fake content');

        $this->imageService->deleteImage('products/test.jpg', 'products/thumbnails/test_thumb.jpg');

        Storage::disk('public')->assertMissing('products/test.jpg');
        Storage::disk('public')->assertMissing('products/thumbnails/test_thumb.jpg');
    }

    public function test_can_delete_image_without_thumbnail(): void
    {
        Storage::disk('public')->put('products/test.jpg', 'fake content');

        $this->imageService->deleteImage('products/test.jpg', null);

        Storage::disk('public')->assertMissing('products/test.jpg');
    }

    /**
     * 異常系: $fileにstringを入力した場合
     * Type宣言によりTypeErrorが発生する
     */
    public function test_process_product_image_throws_type_error_with_string(): void
    {
        $this->expectException(\TypeError::class);
        
        // @phpstan-ignore-next-line
        // stringを渡すとTypeErrorが発生
        $this->imageService->processProductImage('invalid_string', 'products');
    }

    /**
     * 正常系: 返り値がarrayであることを確認（型チェック）
     * 返り値がboolではないことを確認
     */
    public function test_process_product_image_returns_array(): void
    {
        $image = UploadedFile::fake()->image('product.jpg', 1000, 1000);

        $result = $this->imageService->processProductImage($image);

        // 返り値がarrayであることを確認
        $this->assertIsArray($result);
        // 返り値がboolではないことを確認
        $this->assertFalse(is_bool($result));
        $this->assertArrayHasKey('path', $result);
    }
}


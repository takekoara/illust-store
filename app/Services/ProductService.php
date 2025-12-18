<?php

namespace App\Services;

use App\Models\Product;
use App\Models\Tag;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class ProductService
{
    protected ImageService $imageService;

    public function __construct(ImageService $imageService)
    {
        $this->imageService = $imageService;
    }

    /**
     * Create a new product
     */
    public function createProduct(array $data, array $images, ?array $tagIds = null, ?array $tagNames = null): Product
    {
        $uploadedFiles = []; // アップロードしたファイルのパスを記録

        try {
            return DB::transaction(function () use ($data, $images, $tagIds, $tagNames, &$uploadedFiles) {
                $product = Product::create($data);

                // Process and store images
                foreach ($images as $index => $image) {
                    $processed = $this->imageService->processProductImage($image, 'products', [
                        'max_width' => 1920,
                        'max_height' => 1920,
                        'quality' => 85,
                        'generate_thumbnail' => true,
                    ]);

                    // アップロードしたファイルのパスを記録
                    $uploadedFiles[] = $processed;

                    $product->images()->create([
                        'image_path' => $processed['path'],
                        'thumbnail_path' => $processed['thumbnail_path'],
                        'sort_order' => $index,
                        'is_primary' => $index === 0,
                    ]);
                }

                // Handle tags
                $finalTagIds = $this->processTags($tagIds, $tagNames);
                if (! empty($finalTagIds)) {
                    $product->tags()->attach($finalTagIds);
                }

                // Clear cache
                Cache::forget('tags.all');

                return $product;
            });
        } catch (\Exception $e) {
            // エラー時はアップロードしたファイルを削除
            foreach ($uploadedFiles as $file) {
                $this->imageService->deleteImage($file['path'], $file['thumbnail_path'] ?? null);
            }
            throw $e; // 例外を再スローしてトランザクションをロールバック
        }
    }

    /**
     * Update a product
     */
    public function updateProduct(Product $product, array $data, ?array $newImages = null, ?array $combinedOrder = null, ?array $tagIds = null, ?array $tagNames = null): Product
    {
        $uploadedFiles = []; // 新規アップロードしたファイルのパスを記録

        try {
            return DB::transaction(function () use ($product, $data, $newImages, $combinedOrder, $tagIds, $tagNames, &$uploadedFiles) {
                $product->update($data);

                // Handle new images
                $newImageIds = [];
                if ($newImages) {
                    foreach ($newImages as $index => $image) {
                        $processed = $this->imageService->processProductImage($image, 'products', [
                            'max_width' => 1920,
                            'max_height' => 1920,
                            'quality' => 85,
                            'generate_thumbnail' => true,
                        ]);

                        // アップロードしたファイルのパスを記録
                        $uploadedFiles[] = $processed;

                        $newImage = $product->images()->create([
                            'image_path' => $processed['path'],
                            'thumbnail_path' => $processed['thumbnail_path'],
                            'sort_order' => 9999,
                            'is_primary' => false,
                        ]);
                        $newImageIds[] = $newImage->id;
                    }
                }

                // Handle image ordering
                if ($combinedOrder) {
                    $allImageIds = [];
                    foreach ($combinedOrder as $orderItem) {
                        if ($orderItem['type'] === 'new' && isset($newImageIds[$orderItem['index']])) {
                            $allImageIds[] = $newImageIds[$orderItem['index']];
                        } elseif ($orderItem['type'] === 'existing' && isset($orderItem['id'])) {
                            $allImageIds[] = $orderItem['id'];
                        }
                    }

                    // Delete images not in order
                    if (! empty($allImageIds)) {
                        $imagesToDelete = $product->images()->whereNotIn('id', $allImageIds)->get();
                        foreach ($imagesToDelete as $image) {
                            $this->imageService->deleteImage($image->image_path, $image->thumbnail_path);
                        }
                        $product->images()->whereNotIn('id', $allImageIds)->delete();
                    } else {
                        // All images should be deleted
                        $imagesToDelete = $product->images()->get();
                        foreach ($imagesToDelete as $image) {
                            $this->imageService->deleteImage($image->image_path, $image->thumbnail_path);
                        }
                        $product->images()->delete();
                    }

                    // Update sort order
                    foreach ($allImageIds as $index => $imageId) {
                        $product->images()->where('id', $imageId)->update([
                            'sort_order' => $index,
                            'is_primary' => $index === 0,
                        ]);
                    }
                }

                // Handle tags
                $finalTagIds = $this->processTags($tagIds, $tagNames);
                if (! empty($finalTagIds)) {
                    $product->tags()->sync($finalTagIds);
                } else {
                    $product->tags()->detach();
                }

                return $product->fresh();
            });
        } catch (\Exception $e) {
            // エラー時は新規アップロードしたファイルを削除
            foreach ($uploadedFiles as $file) {
                $this->imageService->deleteImage($file['path'], $file['thumbnail_path'] ?? null);
            }
            throw $e; // 例外を再スローしてトランザクションをロールバック
        }
    }

    /**
     * Delete a product
     */
    public function deleteProduct(Product $product): bool
    {
        return DB::transaction(function () use ($product) {
            // Delete images
            foreach ($product->images as $image) {
                $this->imageService->deleteImage($image->image_path, $image->thumbnail_path);
            }

            return $product->delete();
        });
    }

    /**
     * Process tags (existing IDs and new tag names)
     */
    protected function processTags(?array $tagIds, ?array $tagNames): array
    {
        $finalTagIds = $tagIds ?? [];

        if ($tagNames) {
            foreach ($tagNames as $tagName) {
                $tagName = trim($tagName);
                if (! empty($tagName)) {
                    $tag = Tag::firstOrCreate(['name' => $tagName]);
                    if (! in_array($tag->id, $finalTagIds)) {
                        $finalTagIds[] = $tag->id;
                    }
                }
            }
        }

        return $finalTagIds;
    }
}

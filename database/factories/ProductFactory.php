<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Product>
 */
class ProductFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $titles = [
            '美しい風景イラスト',
            'キャラクターイラスト',
            '背景イラスト',
            'アイコンセット',
            'デザインパターン',
            'テクスチャ素材',
            'イラスト素材集',
            'クリップアート',
            'アイコン素材',
            '背景素材',
            '装飾イラスト',
            'キャラクターデザイン',
            '風景画',
            '人物イラスト',
            '動物イラスト',
            '植物イラスト',
            '建築イラスト',
            'ファンタジーイラスト',
            'SFイラスト',
            '和風イラスト',
        ];

        $descriptions = [
            '高品質なイラスト素材です。商用利用可能です。',
            '様々な用途にご利用いただけるイラストです。',
            'プロが作成した高品質な素材です。',
            'デザインに最適なイラスト素材です。',
            '使いやすいイラスト素材集です。',
            '美しいデザインのイラストです。',
            '多様な用途に対応したイラスト素材です。',
            '高解像度のイラスト素材です。',
        ];

        return [
            'user_id' => User::factory(),
            'title' => fake()->randomElement($titles) . ' ' . fake()->numberBetween(1, 1000),
            'description' => fake()->randomElement($descriptions),
            'price' => fake()->randomFloat(2, 100, 10000),
            'sort_order' => 0,
            'is_active' => true,
            'views' => fake()->numberBetween(0, 1000),
            'sales_count' => fake()->numberBetween(0, 100),
        ];
    }
}

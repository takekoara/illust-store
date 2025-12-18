<?php

namespace Database\Seeders;

use App\Models\Bookmark;
use App\Models\Like;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductView;
use App\Models\Tag;
use App\Models\User;
use Illuminate\Database\Seeder;

class DemoProductSeeder extends Seeder
{
    public $productCount = 100;

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        if ($this->command) {
            $this->command->info('デモ商品データを生成中...');
        }

        // タグを準備（既存のタグを使用、なければ作成）
        $tagNames = [
            'オリジナル', '女の子', '男の子', '背景', '風景', 'キャラクター',
            'アイコン', 'デザイン', 'テクスチャ', '装飾', '和風', '洋風',
            'ファンタジー', 'SF', '動物', '植物', '建築', '人物',
            'イラスト', '素材', 'クリップアート', 'パターン', 'ベクター',
        ];

        $tags = [];
        foreach ($tagNames as $tagName) {
            $tags[] = Tag::firstOrCreate(['name' => $tagName]);
        }
        if ($this->command) {
            $this->command->info(count($tags).'個のタグを準備しました。');
        }

        // 管理者ユーザーを取得（なければ作成）
        $adminUser = User::where('is_admin', true)->first();
        if (! $adminUser) {
            $adminUser = User::factory()->create([
                'name' => 'Demo Admin',
                'email' => 'demo@example.com',
                'is_admin' => true,
            ]);
        }

        // 追加のユーザーを作成（商品の作者として使用）
        $users = User::where('is_admin', true)->get();
        if ($users->count() < 5) {
            $additionalUsers = User::factory()->count(5 - $users->count())->create([
                'is_admin' => true,
            ]);
            $users = $users->merge($additionalUsers);
        }

        // 商品数を取得
        $productCount = $this->productCount ?? 100;
        if ($this->command) {
            $this->command->info("{$productCount}個の商品を生成中...");
            $bar = $this->command->getOutput()->createProgressBar($productCount);
            $bar->start();
        }

        // 商品を生成
        for ($i = 0; $i < $productCount; $i++) {
            $user = $users->random();

            $product = Product::factory()->create([
                'user_id' => $user->id,
                'views' => fake()->numberBetween(0, 5000),
                'sales_count' => fake()->numberBetween(0, 200),
            ]);

            // プレースホルダー画像を追加（1-3枚）
            $imageCount = fake()->numberBetween(1, 3);
            for ($j = 0; $j < $imageCount; $j++) {
                // プレースホルダー画像のパス（後で実際の画像に置き換え可能）
                $imagePath = 'products/placeholder-'.fake()->numberBetween(1, 10).'.jpg';

                ProductImage::create([
                    'product_id' => $product->id,
                    'image_path' => $imagePath,
                    'sort_order' => $j,
                    'is_primary' => $j === 0,
                ]);
            }

            // タグをランダムに付与（1-5個）
            $productTags = fake()->randomElements($tags, fake()->numberBetween(1, 5));
            $product->tags()->attach(collect($productTags)->pluck('id'));

            // エンゲージメントデータを生成
            // いいね（0-50個）
            $likeCount = fake()->numberBetween(0, 50);
            $likeUsers = User::where('id', '!=', $user->id)->inRandomOrder()->limit($likeCount)->get();
            foreach ($likeUsers as $likeUser) {
                Like::create([
                    'user_id' => $likeUser->id,
                    'product_id' => $product->id,
                ]);
            }

            // ブックマーク（0-30個）
            $bookmarkCount = fake()->numberBetween(0, 30);
            $bookmarkUsers = User::where('id', '!=', $user->id)->inRandomOrder()->limit($bookmarkCount)->get();
            foreach ($bookmarkUsers as $bookmarkUser) {
                Bookmark::create([
                    'user_id' => $bookmarkUser->id,
                    'product_id' => $product->id,
                ]);
            }

            // 閲覧履歴（0-200件）
            $viewCount = fake()->numberBetween(0, 200);
            for ($k = 0; $k < $viewCount; $k++) {
                ProductView::create([
                    'user_id' => fake()->boolean(70) ? User::inRandomOrder()->first()->id : null,
                    'product_id' => $product->id,
                    'viewed_at' => fake()->dateTimeBetween('-30 days', 'now'),
                    'ip_address' => fake()->ipv4(),
                ]);
            }

            if ($this->command) {
                $bar->advance();
            }
        }

        if ($this->command) {
            $bar->finish();
            $this->command->newLine();
            $this->command->info("✅ {$productCount}個の商品を生成しました！");
            $this->command->info('✅ エンゲージメントデータ（いいね、ブックマーク、閲覧履歴）も生成しました。');
        }
    }
}

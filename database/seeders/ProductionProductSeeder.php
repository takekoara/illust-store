<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\ProductImage;
use App\Models\Tag;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Faker\Factory as Faker;

class ProductionProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faker = Faker::create('ja_JP');
        // 既に商品が存在する場合はスキップ（重複を防ぐ）
        if (Product::count() > 0) {
            if ($this->command) {
                $this->command->info('商品が既に存在するため、シーダーをスキップしました。');
            }
            return;
        }

        if ($this->command) {
            $this->command->info('本番用商品データを生成中...');
        }

        // 管理者ユーザーを取得または作成
        $adminUser = User::where('is_admin', true)->first();
        if (!$adminUser) {
            $adminUser = User::create([
                'name' => 'Admin User',
                'email' => 'admin@example.com',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'is_admin' => true,
            ]);
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

        // 利用可能な画像ファイル（pic1.avif ～ pic18.avif）
        $availableImages = [];
        for ($i = 1; $i <= 18; $i++) {
            $availableImages[] = "products/pic{$i}.avif";
        }

        // 商品タイトルのサンプル
        $productTitles = [
            '美しい風景イラスト',
            'キャラクターデザイン',
            '背景素材セット',
            'アイコンパック',
            'テクスチャ素材',
            '装飾フレーム',
            '和風イラスト',
            '洋風デザイン',
            'ファンタジー世界',
            'SFコンセプト',
            '動物イラスト',
            '植物図鑑',
            '建築スケッチ',
            '人物イラスト',
            'クリップアート',
            'ベクターグラフィック',
            'イラストレーション',
            'アートワーク',
        ];

        // 商品説明のサンプル
        $description = "これはテスト商品です。出典:Unsplash。";

        // 価格の範囲
        $prices = [300, 500, 800, 1000, 1500, 2000, 2500, 3000];

        // 20個の商品を生成
        $productCount = 20;
        if ($this->command) {
            $bar = $this->command->getOutput()->createProgressBar($productCount);
            $bar->start();
        }

        for ($i = 0; $i < $productCount; $i++) {
            // ランダムにタイトル、説明、価格を選択
            $title = $productTitles[array_rand($productTitles)];
            $price = $prices[array_rand($prices)];

            // 商品を作成
            $product = Product::create([
                'user_id' => $adminUser->id,
                'title' => $title . ' ' . ($i + 1),
                'description' => $description,
                'price' => $price,
                'is_active' => true,
                'sort_order' => $i,
                'views' => $faker->numberBetween(0, 1000),
                'sales_count' => $faker->numberBetween(0, 50),
            ]);

            // 1～6個の画像をランダムに選択
            $imageCount = fake()->numberBetween(1, 6);
            $selectedImages = fake()->randomElements($availableImages, min($imageCount, count($availableImages)));

            // 画像を追加
            foreach ($selectedImages as $index => $imagePath) {
                ProductImage::create([
                    'product_id' => $product->id,
                    'image_path' => $imagePath,
                    'sort_order' => $index,
                    'is_primary' => $index === 0,
                ]);
            }

            // タグをランダムに付与（1～5個）
            $productTags = $faker->randomElements($tags, $faker->numberBetween(1, 5));
            $product->tags()->attach(collect($productTags)->pluck('id'));

            if ($this->command) {
                $bar->advance();
            }
        }

        if ($this->command) {
            $bar->finish();
            $this->command->newLine();
            $this->command->info("✅ {$productCount}個の商品を生成しました！");
            $this->command->info("✅ 画像は pic1.avif ～ pic18.avif からランダムに選択されました。");
        }
    }
}


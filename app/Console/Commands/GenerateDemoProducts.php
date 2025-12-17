<?php

namespace App\Console\Commands;

use Database\Seeders\DemoProductSeeder;
use Illuminate\Console\Command;

class GenerateDemoProducts extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'demo:generate-products {--count=100 : 生成する商品数}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'デモ用のダミー商品データを生成します（推薦アルゴリズムのテスト用）';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $count = (int) $this->option('count');

        if ($count < 1) {
            $this->error('商品数は1以上である必要があります。');
            return 1;
        }

        $this->info("デモ商品データを生成します（{$count}個）...");
        $this->newLine();

        // Seederにコマンドインスタンスを渡すために、直接実行
        $seeder = new DemoProductSeeder();
        $seeder->setCommand($this);
        
        // 商品数を設定するために、プロパティで渡す
        $seeder->productCount = $count;
        $seeder->run();

        $this->newLine();
        $this->info('✅ デモ商品データの生成が完了しました！');
        $this->info('推薦アルゴリズムのテストが可能です。');

        return 0;
    }
}

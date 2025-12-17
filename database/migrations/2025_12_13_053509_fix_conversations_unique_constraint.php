<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('conversations', function (Blueprint $table) {
            // 既存のUNIQUE制約を削除
            $table->dropUnique(['user_one_id', 'user_two_id']);
        });

        Schema::table('conversations', function (Blueprint $table) {
            // 新しいUNIQUE制約を追加
            // user_one_id, user_two_id, product_id の組み合わせでUNIQUE
            // これにより、同じユーザー同士でも異なる商品について別の会話を作成できる
            // directタイプのチャットではproduct_idがnullなので、同じユーザー同士のdirectチャットは1つだけになる
            $table->unique(['user_one_id', 'user_two_id', 'product_id'], 'conversations_user_product_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('conversations', function (Blueprint $table) {
            // 新しいUNIQUE制約を削除
            $table->dropUnique('conversations_user_product_unique');
        });

        Schema::table('conversations', function (Blueprint $table) {
            // 元のUNIQUE制約を復元
            $table->unique(['user_one_id', 'user_two_id']);
        });
    }
};

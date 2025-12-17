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
            $table->foreignId('product_id')->nullable()->after('user_two_id')->constrained()->onDelete('cascade');
            $table->string('type')->default('direct')->after('product_id'); // 'direct' or 'product'
            $table->string('title')->nullable()->after('type'); // 商品名など
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('conversations', function (Blueprint $table) {
            $table->dropForeign(['product_id']);
            $table->dropColumn(['product_id', 'type', 'title']);
        });
    }
};

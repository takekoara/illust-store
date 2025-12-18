<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 既存のユーザーを管理者にする場合
        $user = User::where('email', 'admin@example.com')->first();
        if ($user) {
            $user->update(['is_admin' => true]);
            $this->command->info('既存のユーザーを管理者に設定しました: '.$user->email);
        } else {
            // 新しい管理者ユーザーを作成
            User::create([
                'name' => 'Admin User',
                'email' => 'admin@example.com',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'is_admin' => true,
            ]);
            $this->command->info('管理者ユーザーを作成しました: admin@example.com / password');
        }
    }
}

<?php

namespace App\Console\Commands;

use App\Models\Order;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class CleanupPendingOrders extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'orders:cleanup-pending {--hours=24 : 時間で指定した期限を過ぎたpending注文をキャンセルします}';

    /**
     * The console command description.
     */
    protected $description = '一定時間経過した未処理(pending)注文をキャンセル状態へ更新するクリーンアップ処理';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $hours = (int) $this->option('hours');
        $threshold = Carbon::now()->subHours($hours);

        $affected = Order::where('status', 'pending')
            ->where('created_at', '<=', $threshold)
            ->update([
                'status' => 'cancelled',
            ]);

        if ($affected > 0) {
            Log::info('CleanupPendingOrders: cancelled stale pending orders', [
                'affected' => $affected,
                'threshold' => $threshold->toDateTimeString(),
            ]);
        }

        $this->info("Cancelled {$affected} pending orders older than {$hours} hours.");

        return Command::SUCCESS;
    }
}


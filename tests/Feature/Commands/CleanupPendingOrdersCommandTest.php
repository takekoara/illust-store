<?php

namespace Tests\Feature\Commands;

use App\Models\Order;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CleanupPendingOrdersCommandTest extends TestCase
{
    use RefreshDatabase;

    public function test_cancels_stale_pending_orders(): void
    {
        $user = User::factory()->create();

        $stale = Order::factory()->create([
            'user_id' => $user->id,
            'status' => 'pending',
            'created_at' => Carbon::now()->subDays(2),
        ]);

        $recent = Order::factory()->create([
            'user_id' => $user->id,
            'status' => 'pending',
            'created_at' => Carbon::now()->subHours(2),
        ]);

        $this->artisan('orders:cleanup-pending --hours=24')
            ->expectsOutput('Cancelled 1 pending orders older than 24 hours.')
            ->assertExitCode(0);

        $this->assertSame('cancelled', $stale->fresh()->status);
        $this->assertSame('pending', $recent->fresh()->status);
    }
}

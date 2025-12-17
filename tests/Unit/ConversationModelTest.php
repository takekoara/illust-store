<?php

namespace Tests\Unit;

use App\Models\Conversation;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ConversationModelTest extends TestCase
{
    use RefreshDatabase;

    public function test_conversation_automatically_orders_user_ids(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();

        // user_one_idが大きいIDで作成を試みる
        $conversation = Conversation::create([
            'user_one_id' => max($user1->id, $user2->id),
            'user_two_id' => min($user1->id, $user2->id),
            'type' => 'direct',
        ]);

        // boot()メソッドで自動的に順序が調整される
        $this->assertEquals(min($user1->id, $user2->id), $conversation->user_one_id);
        $this->assertEquals(max($user1->id, $user2->id), $conversation->user_two_id);
    }

    public function test_scope_between_users_finds_conversation(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();
        $conversation = Conversation::factory()->create([
            'user_one_id' => min($user1->id, $user2->id),
            'user_two_id' => max($user1->id, $user2->id),
        ]);

        $found = Conversation::betweenUsers($user1->id, $user2->id)->first();

        $this->assertNotNull($found);
        $this->assertEquals($conversation->id, $found->id);
    }

    public function test_scope_between_users_works_regardless_of_order(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();
        $conversation = Conversation::factory()->create([
            'user_one_id' => min($user1->id, $user2->id),
            'user_two_id' => max($user1->id, $user2->id),
        ]);

        // 順序を逆にして検索しても見つかる
        $found1 = Conversation::betweenUsers($user1->id, $user2->id)->first();
        $found2 = Conversation::betweenUsers($user2->id, $user1->id)->first();

        $this->assertNotNull($found1);
        $this->assertNotNull($found2);
        $this->assertEquals($found1->id, $found2->id);
    }

    public function test_scope_for_user_finds_all_user_conversations(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();
        $user3 = User::factory()->create();

        Conversation::factory()->create([
            'user_one_id' => min($user1->id, $user2->id),
            'user_two_id' => max($user1->id, $user2->id),
        ]);
        Conversation::factory()->create([
            'user_one_id' => min($user1->id, $user3->id),
            'user_two_id' => max($user1->id, $user3->id),
        ]);

        $conversations = Conversation::forUser($user1->id)->get();

        $this->assertCount(2, $conversations);
    }

    public function test_get_other_user_returns_correct_user(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();
        $conversation = Conversation::factory()->create([
            'user_one_id' => min($user1->id, $user2->id),
            'user_two_id' => max($user1->id, $user2->id),
        ]);

        $otherUser1 = $conversation->getOtherUser($user1->id);
        $otherUser2 = $conversation->getOtherUser($user2->id);

        $this->assertEquals($user2->id, $otherUser1->id);
        $this->assertEquals($user1->id, $otherUser2->id);
    }
}


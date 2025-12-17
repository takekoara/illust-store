<?php

namespace Database\Factories;

use App\Models\Conversation;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Conversation>
 */
class ConversationFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();
        
        // user_one_idを常に小さい方にする
        $userOneId = min($user1->id, $user2->id);
        $userTwoId = max($user1->id, $user2->id);
        
        return [
            'user_one_id' => $userOneId,
            'user_two_id' => $userTwoId,
            'product_id' => null,
            'type' => 'direct',
            'title' => null,
            'last_message_at' => now(),
        ];
    }

    /**
     * Indicate that the conversation is product-related.
     */
    public function productRelated(): static
    {
        return $this->state(fn (array $attributes) => [
            'product_id' => Product::factory(),
            'type' => 'product',
            'title' => fake()->sentence(),
        ]);
    }
}


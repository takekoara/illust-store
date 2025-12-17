<?php

namespace Database\Factories;

use App\Models\CustomNotification;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\CustomNotification>
 */
class CustomNotificationFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'type' => fake()->randomElement(['like', 'follow', 'message', 'bookmark']),
            'title' => fake()->sentence(),
            'message' => fake()->paragraph(),
            'link' => fake()->url(),
            'is_read' => false,
            'data' => null,
        ];
    }

    /**
     * Indicate that the notification is read.
     */
    public function read(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_read' => true,
        ]);
    }
}


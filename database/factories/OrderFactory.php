<?php

namespace Database\Factories;

use App\Models\Order;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Order>
 */
class OrderFactory extends Factory
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
            'order_number' => 'ORD-'.strtoupper(fake()->unique()->bothify('##########')),
            'total_amount' => fake()->randomFloat(2, 100, 10000),
            'status' => 'pending',
            'stripe_payment_intent_id' => null,
            'stripe_customer_id' => null,
            'billing_address' => [
                'name' => fake()->name(),
                'email' => fake()->email(),
                'address' => fake()->address(),
            ],
        ];
    }

    /**
     * Indicate that the order is completed.
     */
    public function completed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'completed',
        ]);
    }
}

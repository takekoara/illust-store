<?php

namespace Tests\Feature;

use App\Models\Follow;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FollowControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    private User $targetUser;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
        $this->targetUser = User::factory()->create();
    }

    public function test_guest_cannot_follow_user(): void
    {
        $response = $this->post(route('follow.store'), [
            'user_id' => $this->targetUser->id,
        ]);

        $response->assertRedirect(route('login'));
    }

    public function test_user_can_follow_another_user(): void
    {
        $response = $this->actingAs($this->user)->post(route('follow.store'), [
            'user_id' => $this->targetUser->id,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('follows', [
            'follower_id' => $this->user->id,
            'following_id' => $this->targetUser->id,
        ]);
    }

    public function test_user_cannot_follow_themselves(): void
    {
        $response = $this->actingAs($this->user)->post(route('follow.store'), [
            'user_id' => $this->user->id,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseMissing('follows', [
            'follower_id' => $this->user->id,
            'following_id' => $this->user->id,
        ]);
    }

    public function test_user_cannot_follow_same_user_twice(): void
    {
        // Arrange
        Follow::create([
            'follower_id' => $this->user->id,
            'following_id' => $this->targetUser->id,
        ]);

        // Act
        $response = $this->actingAs($this->user)->post(route('follow.store'), [
            'user_id' => $this->targetUser->id,
        ]);

        // Assert
        $response->assertRedirect();
        $this->assertEquals(1, Follow::where('follower_id', $this->user->id)
            ->where('following_id', $this->targetUser->id)
            ->count());
    }

    public function test_user_can_unfollow_another_user(): void
    {
        // Arrange
        Follow::create([
            'follower_id' => $this->user->id,
            'following_id' => $this->targetUser->id,
        ]);

        // Act
        $response = $this->actingAs($this->user)->delete(route('follow.destroy', $this->targetUser));

        // Assert
        $response->assertRedirect();
        $this->assertDatabaseMissing('follows', [
            'follower_id' => $this->user->id,
            'following_id' => $this->targetUser->id,
        ]);
    }

    public function test_unfollow_non_followed_user_fails_gracefully(): void
    {
        $response = $this->actingAs($this->user)->delete(route('follow.destroy', $this->targetUser));

        $response->assertRedirect();
        // Should not throw error
    }

    public function test_can_view_user_followers(): void
    {
        // Arrange
        $followers = User::factory()->count(3)->create();
        foreach ($followers as $follower) {
            Follow::create([
                'follower_id' => $follower->id,
                'following_id' => $this->targetUser->id,
            ]);
        }

        // Act
        $response = $this->actingAs($this->user)->get(route('followers', $this->targetUser));

        // Assert
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Users/Followers')
            ->has('followers.data', 3)
        );
    }

    public function test_can_view_user_following(): void
    {
        // Arrange
        $following = User::factory()->count(3)->create();
        foreach ($following as $followed) {
            Follow::create([
                'follower_id' => $this->targetUser->id,
                'following_id' => $followed->id,
            ]);
        }

        // Act
        $response = $this->actingAs($this->user)->get(route('following', $this->targetUser));

        // Assert
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Users/Following')
            ->has('following.data', 3)
        );
    }

    public function test_followers_list_is_paginated(): void
    {
        // Arrange
        $followers = User::factory()->count(25)->create();
        foreach ($followers as $follower) {
            Follow::create([
                'follower_id' => $follower->id,
                'following_id' => $this->targetUser->id,
            ]);
        }

        // Act
        $response = $this->actingAs($this->user)->get(route('followers', $this->targetUser));

        // Assert
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->has('followers.links')
        );
    }

    public function test_validation_requires_user_id(): void
    {
        $response = $this->actingAs($this->user)->post(route('follow.store'), []);

        $response->assertSessionHasErrors('user_id');
    }

    public function test_validation_requires_existing_user(): void
    {
        $response = $this->actingAs($this->user)->post(route('follow.store'), [
            'user_id' => 99999,
        ]);

        $response->assertSessionHasErrors('user_id');
    }
}

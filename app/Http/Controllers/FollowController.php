<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\FollowService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class FollowController extends Controller
{
    public function __construct(
        private readonly FollowService $followService
    ) {}

    /**
     * Follow a user
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        $following = User::findOrFail($validated['user_id']);
        $result = $this->followService->follow(Auth::user(), $following);

        return back()->with($result['success'] ? 'success' : 'error', $result['message']);
    }

    /**
     * Unfollow a user
     */
    public function destroy(User $user)
    {
        $result = $this->followService->unfollow(Auth::user(), $user);

        return back()->with($result['success'] ? 'success' : 'error', $result['message']);
    }

    /**
     * Get followers list
     */
    public function followers(User $user)
    {
        $followers = $this->followService->getFollowers($user);

        return Inertia::render('Users/Followers', [
            'user' => $user,
            'followers' => $followers,
        ]);
    }

    /**
     * Get following list
     */
    public function following(User $user)
    {
        $following = $this->followService->getFollowing($user);

        return Inertia::render('Users/Following', [
            'user' => $user,
            'following' => $following,
        ]);
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\Follow;
use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class FollowController extends Controller
{
    /**
     * Follow a user
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        if ($validated['user_id'] === Auth::id()) {
            return back()->with('error', '自分自身をフォローすることはできません。');
        }

        $existingFollow = Follow::where('follower_id', Auth::id())
            ->where('following_id', $validated['user_id'])
            ->first();

        if ($existingFollow) {
            return back()->with('error', '既にフォローしています。');
        }

        $followed = User::findOrFail($validated['user_id']);
        
        Follow::create([
            'follower_id' => Auth::id(),
            'following_id' => $validated['user_id'],
        ]);

        // 通知を送信
        $notificationService = app(NotificationService::class);
        $notificationService->notifyFollow($followed, Auth::user());

        return back()->with('success', 'フォローしました。');
    }

    /**
     * Unfollow a user
     */
    public function destroy(User $user)
    {
        Follow::where('follower_id', Auth::id())
            ->where('following_id', $user->id)
            ->delete();

        return back()->with('success', 'フォローを解除しました。');
    }

    /**
     * Get followers list
     */
    public function followers(User $user)
    {
        $followers = $user->followers()->paginate(20);

        return \Inertia\Inertia::render('Users/Followers', [
            'user' => $user,
            'followers' => $followers,
        ]);
    }

    /**
     * Get following list
     */
    public function following(User $user)
    {
        $following = $user->following()->paginate(20);

        return \Inertia\Inertia::render('Users/Following', [
            'user' => $user,
            'following' => $following,
        ]);
    }
}

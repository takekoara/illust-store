<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    /**
     * Display user profile
     */
    public function show(User $user): Response
    {
        $user->loadCount(['products', 'followers', 'following']);

        $products = $user->products()
            ->where('is_active', true)
            ->with(['images', 'tags'])
            ->orderBy('sort_order')
            ->orderBy('created_at', 'desc')
            ->paginate(12);

        $isFollowing = false;
        if (Auth::check()) {
            $isFollowing = Auth::user()
                ->following()
                ->where('following_id', $user->id)
                ->exists();
        }

        return Inertia::render('Users/Show', [
            'user' => $user,
            'products' => $products,
            'isFollowing' => $isFollowing,
        ]);
    }
}

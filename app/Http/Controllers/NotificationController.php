<?php

namespace App\Http\Controllers;

use App\Models\CustomNotification;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class NotificationController extends Controller
{
    protected NotificationService $notificationService;

    public function __construct(NotificationService $notificationService)
    {
        $this->notificationService = $notificationService;
    }

    /**
     * Display a listing of notifications
     */
    public function index(Request $request): Response
    {
        try {
            $notifications = CustomNotification::where('user_id', Auth::id())
                ->orderBy('created_at', 'desc')
                ->paginate(20);

            $unreadCount = CustomNotification::where('user_id', Auth::id())
                ->where('is_read', false)
                ->count();

            return Inertia::render('Notifications/Index', [
                'notifications' => $notifications,
                'unreadCount' => $unreadCount,
            ]);
        } catch (\Exception $e) {
            Log::error('Notification index error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }

    /**
     * Mark notification as read
     */
    public function markAsRead(CustomNotification $notification)
    {
        if ($notification->user_id !== Auth::id()) {
            abort(403);
        }

        $this->notificationService->markAsRead($notification);

        // Inertiaリクエストの場合はリロード、通常のリクエストの場合はリダイレクト
        if (request()->header('X-Inertia')) {
            return back();
        }

        return redirect()->route('notifications.index');
    }

    /**
     * Mark all notifications as read
     */
    public function markAllAsRead()
    {
        $count = $this->notificationService->markAllAsRead(Auth::user());

        // Inertiaリクエストの場合はリロード、通常のリクエストの場合はリダイレクト
        if (request()->header('X-Inertia')) {
            return back();
        }

        return redirect()->route('notifications.index');
    }

    /**
     * Get unread count (API endpoint)
     */
    public function unreadCount()
    {
        $count = CustomNotification::where('user_id', Auth::id())
            ->where('is_read', false)
            ->count();

        return response()->json(['count' => $count]);
    }
}


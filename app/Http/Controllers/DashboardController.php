<?php

namespace App\Http\Controllers;

use App\Services\DashboardService;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(
        private readonly DashboardService $dashboardService
    ) {}

    /**
     * Display the dashboard.
     */
    public function index(): Response
    {
        $user = Auth::user();

        if ($user->isAdmin()) {
            $stats = $this->dashboardService->getAdminStats();
            $bookmarks = [];
        } else {
            $stats = $this->dashboardService->getUserStats($user);
            $bookmarks = $this->dashboardService->getUserBookmarks($user);
        }

        return Inertia::render('Dashboard', [
            'stats' => $stats,
            'isAdmin' => $user->isAdmin(),
            'bookmarks' => $bookmarks,
        ]);
    }
}

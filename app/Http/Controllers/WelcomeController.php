<?php

namespace App\Http\Controllers;

use App\Services\WelcomeService;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class WelcomeController extends Controller
{
    public function __construct(
        private readonly WelcomeService $welcomeService
    ) {}

    /**
     * Display the welcome page
     */
    public function index(): Response
    {
        return Inertia::render('Welcome', [
            'canLogin' => Route::has('login'),
            'canRegister' => Route::has('register'),
            'popularProducts' => $this->welcomeService->getPopularProducts(),
            'newProducts' => $this->welcomeService->getNewProducts(),
            'popularTags' => $this->welcomeService->getPopularTags(),
        ]);
    }
}

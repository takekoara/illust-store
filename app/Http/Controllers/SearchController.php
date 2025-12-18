<?php

namespace App\Http\Controllers;

use App\Services\SearchService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SearchController extends Controller
{
    public function __construct(
        private readonly SearchService $searchService
    ) {}

    /**
     * Search products, users, and tags
     */
    public function index(Request $request): Response
    {
        $query = $this->searchService->sanitizeQuery($request->get('q', ''));
        $type = $request->get('type', 'all');

        $results = $this->searchService->search($query, $type);

        return Inertia::render('Search/Index', [
            'query' => $query,
            'type' => $type,
            'results' => $results,
        ]);
    }
}

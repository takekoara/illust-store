<?php

namespace App\Services;

use App\Models\Product;
use App\Models\Tag;
use App\Models\User;
use Illuminate\Support\Collection;

class SearchService
{
    private const MAX_QUERY_LENGTH = 100;
    private const PRODUCTS_LIMIT = 20;
    private const USERS_LIMIT = 10;
    private const TAGS_LIMIT = 10;

    /**
     * Sanitize search query
     */
    public function sanitizeQuery(string $query): string
    {
        $query = trim($query);
        $query = strip_tags($query);
        return mb_substr($query, 0, self::MAX_QUERY_LENGTH);
    }

    /**
     * Execute search based on type
     */
    public function search(string $query, string $type = 'all'): array
    {
        $results = [
            'products' => collect(),
            'users' => collect(),
            'tags' => collect(),
        ];

        if (empty($query)) {
            return $results;
        }

        if ($type === 'all' || $type === 'products') {
            $results['products'] = $this->searchProducts($query);
        }

        if ($type === 'all' || $type === 'users') {
            $results['users'] = $this->searchUsers($query);
        }

        if ($type === 'all' || $type === 'tags') {
            $results['tags'] = $this->searchTags($query);
        }

        return $results;
    }

    /**
     * Search products
     */
    public function searchProducts(string $query): Collection
    {
        return Product::with(['user', 'images', 'tags'])
            ->where('is_active', true)
            ->where(function ($q) use ($query) {
                $q->where('title', 'like', '%' . $query . '%')
                    ->orWhere('description', 'like', '%' . $query . '%')
                    ->orWhereHas('tags', function ($tagQuery) use ($query) {
                        $tagQuery->where('name', 'like', '%' . $query . '%');
                    });
            })
            ->orderBy('created_at', 'desc')
            ->limit(self::PRODUCTS_LIMIT)
            ->get();
    }

    /**
     * Search users
     */
    public function searchUsers(string $query): Collection
    {
        return User::where(function ($q) use ($query) {
                $q->where('name', 'like', '%' . $query . '%')
                    ->orWhere('username', 'like', '%' . $query . '%');
            })
            ->limit(self::USERS_LIMIT)
            ->get();
    }

    /**
     * Search tags
     */
    public function searchTags(string $query): Collection
    {
        return Tag::where('name', 'like', '%' . $query . '%')
            ->limit(self::TAGS_LIMIT)
            ->get();
    }
}


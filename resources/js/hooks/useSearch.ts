import { useState } from 'react';
import { router } from '@inertiajs/react';

type SearchType = 'all' | 'products' | 'users' | 'tags';

interface UseSearchProps {
    initialQuery: string;
    initialType: string;
}

export function useSearch({ initialQuery, initialType }: UseSearchProps) {
    const [query, setQuery] = useState(initialQuery);
    const [type, setType] = useState<SearchType>(initialType as SearchType);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            route('search.index'),
            { q: query, type },
            {
                preserveState: true,
                replace: true,
            }
        );
    };

    return {
        query,
        setQuery,
        type,
        setType,
        handleSearch,
    };
}


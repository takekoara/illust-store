import { useState, useCallback } from 'react';
import { router } from '@inertiajs/react';

interface UseProductSearchProps {
    initialSearch: string;
    routeName: string;
}

interface UseProductSearchReturn {
    search: string;
    setSearch: (value: string) => void;
    handleSearch: (e: React.FormEvent) => void;
}

export function useProductSearch({
    initialSearch,
    routeName,
}: UseProductSearchProps): UseProductSearchReturn {
    const [search, setSearch] = useState(initialSearch);

    const handleSearch = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        router.get(route(routeName), { search }, {
            preserveState: true,
            replace: true,
        });
    }, [search, routeName]);

    return {
        search,
        setSearch,
        handleSearch,
    };
}


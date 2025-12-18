import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { PageProps, ProductListItem, Tag } from '@/types';

// Custom Hooks
import { useSearch } from '@/hooks/useSearch';

// Components
import {
    SearchForm,
    ProductResults,
    UserResults,
    TagResults,
    EmptyResults,
} from './components/index';

interface SearchUser {
    id: number;
    name: string;
    username: string;
    avatar_type?: string | null;
}

interface Props extends PageProps {
    query: string;
    type: string;
    results: {
        products: ProductListItem[];
        users: SearchUser[];
        tags: Tag[];
    };
}

export default function Index({ query: initialQuery, type: initialType, results }: Props) {
    const { query, setQuery, type, setType, handleSearch } = useSearch({
        initialQuery,
        initialType,
    });

    const showProducts = type === 'all' || type === 'products';
    const showUsers = type === 'all' || type === 'users';
    const showTags = type === 'all' || type === 'tags';
    const hasResults =
        results.products.length > 0 ||
        results.users.length > 0 ||
        results.tags.length > 0;

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    検索
                </h2>
            }
        >
            <Head title="検索" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <SearchForm
                        query={query}
                        type={type}
                        onQueryChange={setQuery}
                        onTypeChange={setType}
                        onSubmit={handleSearch}
                    />

                    {showProducts && <ProductResults products={results.products} />}
                    {showUsers && <UserResults users={results.users} />}
                    {showTags && <TagResults tags={results.tags} />}

                    {!hasResults && <EmptyResults />}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

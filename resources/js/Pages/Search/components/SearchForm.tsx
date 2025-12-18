import PrimaryButton from '@/Components/PrimaryButton';
import { SearchTypeFilter } from './SearchTypeFilter';

type SearchType = 'all' | 'products' | 'users' | 'tags';

interface SearchFormProps {
    query: string;
    type: SearchType;
    onQueryChange: (query: string) => void;
    onTypeChange: (type: SearchType) => void;
    onSubmit: (e: React.FormEvent) => void;
}

export function SearchForm({
    query,
    type,
    onQueryChange,
    onTypeChange,
    onSubmit,
}: SearchFormProps) {
    return (
        <form onSubmit={onSubmit} className="mb-8 space-y-4">
            <div className="flex gap-2">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => onQueryChange(e.target.value)}
                    placeholder="検索..."
                    className="block flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
                <PrimaryButton type="submit">検索</PrimaryButton>
            </div>
            <SearchTypeFilter currentType={type} onTypeChange={onTypeChange} />
        </form>
    );
}


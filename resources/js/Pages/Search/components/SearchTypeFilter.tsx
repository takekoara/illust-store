type SearchType = 'all' | 'products' | 'users' | 'tags';

interface FilterOption {
    value: SearchType;
    label: string;
}

const FILTER_OPTIONS: FilterOption[] = [
    { value: 'all', label: 'すべて' },
    { value: 'products', label: '商品' },
    { value: 'users', label: 'ユーザー' },
    { value: 'tags', label: 'タグ' },
];

interface SearchTypeFilterProps {
    currentType: SearchType;
    onTypeChange: (type: SearchType) => void;
}

export function SearchTypeFilter({ currentType, onTypeChange }: SearchTypeFilterProps) {
    return (
        <div className="flex gap-2">
            {FILTER_OPTIONS.map((option) => (
                <button
                    key={option.value}
                    type="button"
                    onClick={() => onTypeChange(option.value)}
                    className={`rounded-md px-4 py-2 text-sm ${
                        currentType === option.value
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                    {option.label}
                </button>
            ))}
        </div>
    );
}


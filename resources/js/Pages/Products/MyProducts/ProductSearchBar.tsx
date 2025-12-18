import PrimaryButton from '@/Components/PrimaryButton';

interface ProductSearchBarProps {
    search: string;
    onSearchChange: (value: string) => void;
    onSubmit: (e: React.FormEvent) => void;
}

export function ProductSearchBar({
    search,
    onSearchChange,
    onSubmit,
}: ProductSearchBarProps) {
    return (
        <div className="mb-6">
            <form onSubmit={onSubmit} className="flex gap-2">
                <input
                    type="text"
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="商品を検索..."
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
                <PrimaryButton type="submit">検索</PrimaryButton>
            </form>
        </div>
    );
}


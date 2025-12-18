import { Link } from '@inertiajs/react';

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface ProductPaginationProps {
    links: PaginationLink[];
}

export function ProductPagination({ links }: ProductPaginationProps) {
    if (!links || links.length <= 3) return null;

    return (
        <div className="border-t p-4">
            <nav className="flex justify-center gap-1">
                {links.map((link, index) => (
                    <Link
                        key={index}
                        href={link.url || '#'}
                        className={`px-4 py-2 rounded-md ${
                            link.active
                                ? 'bg-indigo-600 text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-50'
                        } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                ))}
            </nav>
        </div>
    );
}


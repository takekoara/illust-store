import { Link } from '@inertiajs/react';

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginationProps {
    links: PaginationLink[];
    className?: string;
}

export default function Pagination({ links, className = '' }: PaginationProps) {
    if (!links || links.length <= 3) return null;

    return (
        <nav className={`flex justify-center gap-1 ${className}`}>
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
    );
}


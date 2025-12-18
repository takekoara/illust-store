import { Link } from '@inertiajs/react';

interface TechItem {
    name: string;
    href?: string;
}

interface TechCategory {
    title: string;
    items: TechItem[];
}

const techCategories: TechCategory[] = [
    {
        title: 'バックエンド',
        items: [
            { name: 'Laravel 12' },
            { name: 'PHP 8.2+' },
            { name: 'MySQL/SQLite' },
            { name: 'Stripe API' },
        ],
    },
    {
        title: 'フロントエンド',
        items: [
            { name: 'React 18' },
            { name: 'TypeScript' },
            { name: 'Inertia.js' },
            { name: 'Tailwind CSS' },
        ],
    },
    {
        title: 'その他',
        items: [
            { name: 'Laravel Reverb (WebSocket)' },
            { name: 'Laravel Queue' },
            { name: 'Vite' },
        ],
    },
    {
        title: '素材',
        items: [
            { name: '画像: Unsplash', href: 'https://unsplash.com/' },
            { name: 'アイコン: ノーコピーライトガール', href: 'https://fromtheasia.com/illustration/nocopyrightgirl' },
        ],
    },
];

export function TechStackGrid() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {techCategories.map((category) => (
                <div key={category.title} className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">{category.title}</h3>
                    <ul className="text-sm space-y-1 text-gray-600">
                        {category.items.map((item) => (
                            <li key={item.name}>
                                •{' '}
                                {item.href ? (
                                    <Link href={item.href} target="_blank" className="hover:text-indigo-600">
                                        {item.name}
                                    </Link>
                                ) : (
                                    item.name
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    );
}


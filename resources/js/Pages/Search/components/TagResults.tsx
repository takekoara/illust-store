import { Link } from '@inertiajs/react';
import { Tag } from '@/types';

interface TagResultsProps {
    tags: Tag[];
}

export function TagResults({ tags }: TagResultsProps) {
    if (tags.length === 0) return null;

    return (
        <div className="mb-8">
            <h3 className="mb-4 text-lg font-semibold">タグ</h3>
            <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                    <Link
                        key={tag.id}
                        href={route('products.index', { tag: tag.slug })}
                        className="rounded-full bg-indigo-100 px-4 py-2 text-indigo-700 hover:bg-indigo-200"
                    >
                        #{tag.name}
                    </Link>
                ))}
            </div>
        </div>
    );
}


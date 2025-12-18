import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { PageProps } from '@/types';
import Pagination from '@/Components/Pagination';

// Components
import { BookmarkCard, EmptyBookmarks } from './components';

interface BookmarkProduct {
    id: number;
    title: string;
    price: number;
    user: {
        id: number;
        name: string;
        username: string;
        avatar: string | null;
        avatar_type?: string | null;
    };
    images: Array<{
        id: number;
        image_path: string;
        is_primary: boolean;
    }>;
    tags?: Array<{
        id: number;
        name: string;
    }>;
}

interface Bookmark {
    id: number;
    created_at: string;
    product: BookmarkProduct;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginationMeta {
    current_page: number;
    from: number;
    last_page: number;
    per_page: number;
    to: number;
    total: number;
}

interface PaginatedBookmarks {
    data: Bookmark[];
    links: PaginationLink[];
    meta: PaginationMeta;
}

interface Props extends PageProps {
    bookmarks: PaginatedBookmarks;
}

export default function Index({ bookmarks }: Props) {
    const isEmpty = !bookmarks?.data || bookmarks.data.length === 0;

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    ブックマーク
                </h2>
            }
        >
            <Head title="ブックマーク" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {isEmpty ? (
                        <EmptyBookmarks />
                    ) : (
                        <>
                            {bookmarks.meta?.total && (
                                <div className="mb-6">
                                    <p className="text-sm text-gray-600">
                                        全{bookmarks.meta.total}件のブックマーク
                                    </p>
                                </div>
                            )}

                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {bookmarks.data.map((bookmark) => (
                                    <BookmarkCard key={bookmark.id} bookmark={bookmark} />
                                ))}
                            </div>

                            {/* ページネーション */}
                            {bookmarks.links && bookmarks.links.length > 3 && (
                                <Pagination links={bookmarks.links} />
                            )}
                        </>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

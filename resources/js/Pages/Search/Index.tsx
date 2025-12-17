import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { PageProps, ProductListItem, Tag } from '@/types';
import { useState } from 'react';
import PrimaryButton from '@/Components/PrimaryButton';

interface SearchUser {
    id: number;
    name: string;
    username: string;
    avatar: string | null;
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

export default function Index({ query, type, results, auth }: Props) {
    const [searchQuery, setSearchQuery] = useState(query);
    const [searchType, setSearchType] = useState(type);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            route('search.index'),
            { q: searchQuery, type: searchType },
            {
                preserveState: true,
                replace: true,
            }
        );
    };

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
                    {/* Search Form */}
                    <div className="mb-8">
                        <form onSubmit={handleSearch} className="space-y-4">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="検索..."
                                    className="block flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                />
                                <PrimaryButton type="submit">検索</PrimaryButton>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setSearchType('all')}
                                    className={`rounded-md px-4 py-2 text-sm ${
                                        searchType === 'all'
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    すべて
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSearchType('products')}
                                    className={`rounded-md px-4 py-2 text-sm ${
                                        searchType === 'products'
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    商品
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSearchType('users')}
                                    className={`rounded-md px-4 py-2 text-sm ${
                                        searchType === 'users'
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    ユーザー
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSearchType('tags')}
                                    className={`rounded-md px-4 py-2 text-sm ${
                                        searchType === 'tags'
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    タグ
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Results */}
                    {(searchType === 'all' || searchType === 'products') &&
                        results.products.length > 0 && (
                            <div className="mb-8">
                                <h3 className="mb-4 text-lg font-semibold">商品</h3>
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                                    {results.products.map((product) => {
                                        const primaryImage =
                                            product.images?.find((img) => img.is_primary) ||
                                            product.images?.[0];
                                        const imageUrl = primaryImage
                                            ? `/images/${primaryImage.image_path}`
                                            : '/placeholder-image.jpg';

                                        return (
                                            <Link
                                                key={product.id}
                                                href={route('products.show', product.id)}
                                                className="group overflow-hidden rounded-lg bg-white shadow-sm transition-shadow hover:shadow-md"
                                            >
                                                <div className="aspect-square overflow-hidden bg-gray-100">
                                                    <img
                                                        src={imageUrl}
                                                        alt={product.title}
                                                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                                                    />
                                                </div>
                                                <div className="p-4">
                                                    <h4 className="mb-2 text-lg font-semibold text-gray-900 line-clamp-2">
                                                        {product.title}
                                                    </h4>
                                                    <span className="text-xl font-bold text-indigo-600">
                                                        ¥{product.price.toLocaleString()}
                                                    </span>
                                                </div>
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                    {(searchType === 'all' || searchType === 'users') &&
                        results.users.length > 0 && (
                            <div className="mb-8">
                                <h3 className="mb-4 text-lg font-semibold">ユーザー</h3>
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    {results.users.map((user) => (
                                        <Link
                                            key={user.id}
                                            href={`/users/${user.id}`}
                                            className="flex items-center gap-4 rounded-lg bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
                                        >
                                            <img
                                                src={
                                                    user.avatar_type
                                                        ? `/images/avatars/${user.avatar_type}.png`
                                                        : '/images/avatars/default-avatar.png'
                                                }
                                                alt={user.name}
                                                className="h-12 w-12 rounded-full"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = '/images/avatars/default-avatar.png';
                                                }}
                                            />
                                            <div>
                                                <p className="font-semibold text-gray-900">
                                                    {user.username || user.name}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    {user.name}
                                                </p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                    {(searchType === 'all' || searchType === 'tags') &&
                        results.tags.length > 0 && (
                            <div className="mb-8">
                                <h3 className="mb-4 text-lg font-semibold">タグ</h3>
                                <div className="flex flex-wrap gap-2">
                                    {results.tags.map((tag) => (
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
                        )}

                    {results.products.length === 0 &&
                        results.users.length === 0 &&
                        results.tags.length === 0 && (
                            <div className="bg-white p-8 text-center shadow-sm sm:rounded-lg">
                                <p className="text-gray-500">検索結果が見つかりませんでした。</p>
                            </div>
                        )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}


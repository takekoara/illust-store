import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { PageProps, Product } from '@/types';
import { useState } from 'react';
import PrimaryButton from '@/Components/PrimaryButton';

interface Props extends PageProps {
    products: {
        data: Product[];
        links: any;
        meta: any;
    };
    filters: {
        search?: string;
        tag?: string;
    };
}

export default function Index({ products, filters, auth }: Props) {
    const [search, setSearch] = useState(filters.search || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('products.index'), { search }, {
            preserveState: true,
            replace: true,
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        商品一覧
                    </h2>
                    {auth.user && auth.user.is_admin && (
                        <div className="flex gap-2">
                            <Link href={route('products.my-products')}>
                                <PrimaryButton>マイ商品管理</PrimaryButton>
                            </Link>
                            <Link href={route('products.create')}>
                                <PrimaryButton>新規作成</PrimaryButton>
                            </Link>
                        </div>
                    )}
                </div>
            }
        >
            <Head title="商品一覧" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Search Bar */}
                    <div className="mb-6">
                        <form onSubmit={handleSearch} className="flex gap-2">
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="商品を検索..."
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            />
                            <PrimaryButton type="submit">検索</PrimaryButton>
                        </form>
                    </div>

                    {/* Products Grid */}
                    {products.data.length === 0 ? (
                        <div className="bg-white p-8 text-center shadow-sm sm:rounded-lg">
                            <p className="text-gray-500">商品が見つかりませんでした。</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {products.data.map((product) => {
                                const primaryImage = product.images.find(img => img.is_primary) || product.images[0];
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
                                            <h3 className="mb-2 text-lg font-semibold text-gray-900 line-clamp-2">
                                                {product.title}
                                            </h3>
                                            <div className="mb-2 flex items-center gap-2">
                                                <img
                                                    src={product.user.avatar_type ? `/images/avatars/${product.user.avatar_type}.png` : '/images/default-avatar.png'}
                                                    alt={product.user.name}
                                                    className="h-6 w-6 rounded-full"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = '/images/default-avatar.png';
                                                    }}
                                                />
                                                <span className="text-sm text-gray-600">
                                                    {product.user.username || product.user.name}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-xl font-bold text-indigo-600">
                                                    ¥{product.price.toLocaleString()}
                                                </span>
                                                <div className="flex gap-4 text-sm text-gray-500">
                                                    <span>👁 {product.views}</span>
                                                    <span>💰 {product.sales_count}</span>
                                                </div>
                                            </div>
                                            {product.tags.length > 0 && (
                                                <div className="mt-2 flex flex-wrap gap-1">
                                                    {product.tags.slice(0, 3).map((tag) => (
                                                        <span
                                                            key={tag.id}
                                                            className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600"
                                                        >
                                                            #{tag.name}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}

                    {/* Pagination */}
                    {products.links && products.links.length > 3 && (
                        <div className="mt-6 flex justify-center">
                            <nav className="flex gap-1">
                                {products.links.map((link: any, index: number) => (
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
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}


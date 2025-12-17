import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { PageProps, Product } from '@/types';
import { useState } from 'react';
import PrimaryButton from '@/Components/PrimaryButton';
import DangerButton from '@/Components/DangerButton';
import SecondaryButton from '@/Components/SecondaryButton';

interface Props extends PageProps {
    products: {
        data: Product[];
        links: any;
        meta: any;
    };
    filters: {
        search?: string;
    };
}

export default function MyProducts({ products, filters, auth }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [processing, setProcessing] = useState(false);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('products.my-products'), { search }, {
            preserveState: true,
            replace: true,
        });
    };

    const toggleActive = (product: Product) => {
        setProcessing(true);
        router.patch(route('products.update', product.id), {
            is_active: !product.is_active,
        }, {
            preserveScroll: true,
            onFinish: () => setProcessing(false),
        });
    };

    const handleDelete = (productId: number) => {
        if (confirm('本当に削除しますか？')) {
            setProcessing(true);
            router.delete(route('products.destroy', productId), {
                preserveScroll: true,
                onFinish: () => setProcessing(false),
            });
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        マイ商品管理
                    </h2>
                    <Link href={route('products.create')}>
                        <PrimaryButton>新規作成</PrimaryButton>
                    </Link>
                </div>
            }
        >
            <Head title="マイ商品管理" />

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

                    {/* Products Table */}
                    {products.data.length === 0 ? (
                        <div className="bg-white p-8 text-center shadow-sm sm:rounded-lg">
                            <p className="mb-4 text-gray-500">商品がありません。</p>
                            <Link href={route('products.create')}>
                                <PrimaryButton>新規作成</PrimaryButton>
                            </Link>
                        </div>
                    ) : (
                        <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                商品
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                価格
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                閲覧数
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                販売数
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                ステータス
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                並び順
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                                                操作
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white">
                                        {products.data.map((product) => {
                                            const primaryImage =
                                                product.images.find((img) => img.is_primary) ||
                                                product.images[0];
                                            const imageUrl = primaryImage
                                                ? `/storage/${primaryImage.image_path}`
                                                : '/placeholder-image.jpg';

                                            return (
                                                <tr key={product.id}>
                                                    <td className="whitespace-nowrap px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <img
                                                                src={imageUrl}
                                                                alt={product.title}
                                                                className="h-12 w-12 rounded-lg object-cover"
                                                            />
                                                            <div>
                                                                <Link
                                                                    href={route('products.show', product.id)}
                                                                    className="font-semibold text-gray-900 hover:text-indigo-600"
                                                                >
                                                                    {product.title}
                                                                </Link>
                                                                <p className="text-sm text-gray-500 line-clamp-1">
                                                                    {product.description}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-gray-900">
                                                        ¥{product.price.toLocaleString()}
                                                    </td>
                                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                                        {product.views}
                                                    </td>
                                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                                        {product.sales_count}
                                                    </td>
                                                    <td className="whitespace-nowrap px-6 py-4">
                                                        <span
                                                            className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                                                                product.is_active
                                                                    ? 'bg-green-100 text-green-800'
                                                                    : 'bg-gray-100 text-gray-800'
                                                            }`}
                                                        >
                                                            {product.is_active ? '有効' : '無効'}
                                                        </span>
                                                    </td>
                                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                                        {product.sort_order}
                                                    </td>
                                                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                                        <div className="flex justify-end gap-2">
                                                            <Link href={route('products.edit', product.id)}>
                                                                <SecondaryButton className="text-xs">
                                                                    編集
                                                                </SecondaryButton>
                                                            </Link>
                                                            <SecondaryButton
                                                                onClick={() => toggleActive(product)}
                                                                disabled={processing}
                                                                className="text-xs"
                                                            >
                                                                {product.is_active ? '無効化' : '有効化'}
                                                            </SecondaryButton>
                                                            <DangerButton
                                                                onClick={() => handleDelete(product.id)}
                                                                disabled={processing}
                                                                className="text-xs"
                                                            >
                                                                削除
                                                            </DangerButton>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {products.links && products.links.length > 3 && (
                                <div className="border-t p-4">
                                    <nav className="flex justify-center gap-1">
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
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}


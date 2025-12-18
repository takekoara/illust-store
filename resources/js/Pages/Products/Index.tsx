import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { PageProps, Product } from '@/types';

// Custom Hooks
import { useProductSearch } from '@/hooks/useProductSearch';

// Shared Components
import { ProductSearchBar } from './MyProducts/ProductSearchBar';
import { ProductPagination } from './MyProducts/ProductPagination';

// Local Components
import { ProductGrid, EmptyState, AdminActions } from './Index/index';

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
    // Search Hook (reusing from MyProducts)
    const { search, setSearch, handleSearch } = useProductSearch({
        initialSearch: filters.search || '',
        routeName: 'products.index',
    });

    const isAdmin = auth.user?.is_admin;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        商品一覧
                    </h2>
                    {isAdmin && <AdminActions />}
                </div>
            }
        >
            <Head title="商品一覧" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Search Bar (reusing component) */}
                    <ProductSearchBar
                        search={search}
                        onSearchChange={setSearch}
                        onSubmit={handleSearch}
                    />

                    {/* Products */}
                    {products.data.length === 0 ? (
                        <EmptyState />
                    ) : (
                        <ProductGrid products={products.data} />
                    )}

                    {/* Pagination (reusing component) */}
                    <div className="mt-6 flex justify-center">
                        <ProductPagination links={products.links} />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { PageProps, Product } from '@/types';
import PrimaryButton from '@/Components/PrimaryButton';

// Custom Hooks
import { useProductSearch } from '@/hooks/useProductSearch';
import { useProductActions } from '@/hooks/useProductActions';

// Components
import {
    ProductSearchBar,
    ProductTable,
    EmptyProductState,
} from './MyProducts/index';

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

export default function MyProducts({ products, filters }: Props) {
    // Search Hook
    const { search, setSearch, handleSearch } = useProductSearch({
        initialSearch: filters.search || '',
        routeName: 'products.my-products',
    });

    // Product Actions Hook
    const { processing, toggleActive, handleDelete } = useProductActions();

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
                    <ProductSearchBar
                        search={search}
                        onSearchChange={setSearch}
                        onSubmit={handleSearch}
                    />

                    {/* Products */}
                    {products.data.length === 0 ? (
                        <EmptyProductState />
                    ) : (
                        <ProductTable
                            products={products.data}
                            links={products.links}
                            processing={processing}
                            onToggleActive={toggleActive}
                            onDelete={handleDelete}
                        />
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

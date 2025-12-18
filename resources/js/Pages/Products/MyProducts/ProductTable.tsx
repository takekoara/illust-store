import { Product } from '@/types';
import { ProductTableHeader } from './ProductTableHeader';
import { ProductTableRow } from './ProductTableRow';
import { ProductPagination } from './ProductPagination';

interface ProductTableProps {
    products: Product[];
    links: any[];
    processing: boolean;
    onToggleActive: (product: Product) => void;
    onDelete: (productId: number) => void;
}

export function ProductTable({
    products,
    links,
    processing,
    onToggleActive,
    onDelete,
}: ProductTableProps) {
    return (
        <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <ProductTableHeader />
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {products.map((product) => (
                            <ProductTableRow
                                key={product.id}
                                product={product}
                                processing={processing}
                                onToggleActive={onToggleActive}
                                onDelete={onDelete}
                            />
                        ))}
                    </tbody>
                </table>
            </div>

            <ProductPagination links={links} />
        </div>
    );
}


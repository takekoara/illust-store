import { Link } from '@inertiajs/react';
import { Product } from '@/types';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';

interface ProductTableRowProps {
    product: Product;
    processing: boolean;
    onToggleActive: (product: Product) => void;
    onDelete: (productId: number) => void;
}

export function ProductTableRow({
    product,
    processing,
    onToggleActive,
    onDelete,
}: ProductTableRowProps) {
    const primaryImage =
        product.images.find((img) => img.is_primary) || product.images[0];
    const imageUrl = primaryImage
        ? `/images/${primaryImage.image_path}`
        : '/placeholder-image.jpg';

    return (
        <tr>
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
                        onClick={() => onToggleActive(product)}
                        disabled={processing}
                        className="text-xs"
                    >
                        {product.is_active ? '無効化' : '有効化'}
                    </SecondaryButton>
                    <DangerButton
                        onClick={() => onDelete(product.id)}
                        disabled={processing}
                        className="text-xs"
                    >
                        削除
                    </DangerButton>
                </div>
            </td>
        </tr>
    );
}


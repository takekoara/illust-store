import { Link } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';

export function EmptyProductState() {
    return (
        <div className="bg-white p-8 text-center shadow-sm sm:rounded-lg">
            <p className="mb-4 text-gray-500">商品がありません。</p>
            <Link href={route('products.create')}>
                <PrimaryButton>新規作成</PrimaryButton>
            </Link>
        </div>
    );
}


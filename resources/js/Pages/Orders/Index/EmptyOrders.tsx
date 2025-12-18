import { Link } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';

export function EmptyOrders() {
    return (
        <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
            <div className="p-8 text-center">
                <p className="mb-4 text-gray-500">注文履歴がありません。</p>
                <Link href={route('products.index')}>
                    <PrimaryButton>商品を見る</PrimaryButton>
                </Link>
            </div>
        </div>
    );
}


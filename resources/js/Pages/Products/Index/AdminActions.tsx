import { Link } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';

export function AdminActions() {
    return (
        <div className="flex gap-2">
            <Link href={route('products.my-products')}>
                <PrimaryButton>マイ商品管理</PrimaryButton>
            </Link>
            <Link href={route('products.create')}>
                <PrimaryButton>新規作成</PrimaryButton>
            </Link>
        </div>
    );
}


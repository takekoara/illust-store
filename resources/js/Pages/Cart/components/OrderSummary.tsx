import { Link } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';

interface OrderSummaryProps {
    itemCount: number;
    total: number;
}

export function OrderSummary({ itemCount, total }: OrderSummaryProps) {
    return (
        <div className="sticky top-4 overflow-hidden bg-white shadow-sm sm:rounded-lg">
            <div className="p-6">
                <h3 className="mb-4 text-lg font-semibold">注文概要</h3>
                <div className="mb-4 space-y-2">
                    <div className="flex justify-between">
                        <span className="text-gray-600">小計 ({itemCount}点)</span>
                        <span className="font-semibold">¥{total.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                        <span className="text-lg font-semibold">合計</span>
                        <span className="text-lg font-bold text-indigo-600">
                            ¥{total.toLocaleString()}
                        </span>
                    </div>
                </div>
                <Link href={route('orders.create')} className="block w-full">
                    <PrimaryButton className="w-full">レジに進む</PrimaryButton>
                </Link>
            </div>
        </div>
    );
}


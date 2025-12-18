import { Order } from '../shared/types';
import { OrderStatusBadge } from '../shared/OrderStatus';

interface OrderInfoCardProps {
    order: Order;
}

export function OrderInfoCard({ order }: OrderInfoCardProps) {
    return (
        <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
            <div className="p-6">
                <h3 className="mb-4 text-lg font-semibold">注文情報</h3>
                <div className="space-y-3">
                    <div>
                        <p className="text-sm text-gray-500">注文番号</p>
                        <p className="font-semibold">{order.order_number}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">注文日</p>
                        <p className="font-semibold">
                            {new Date(order.created_at).toLocaleDateString('ja-JP')}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">ステータス</p>
                        <OrderStatusBadge status={order.status} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">合計金額</p>
                        <p className="text-xl font-bold text-indigo-600">
                            ¥{order.total_amount.toLocaleString()}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}


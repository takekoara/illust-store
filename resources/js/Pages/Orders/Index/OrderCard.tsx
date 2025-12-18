import { Link } from '@inertiajs/react';
import { Order } from '../shared/types';
import { OrderStatusBadge } from '../shared/OrderStatus';
import { OrderItemCard } from '../shared/OrderItemCard';

interface OrderCardProps {
    order: Order;
}

export function OrderCard({ order }: OrderCardProps) {
    return (
        <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
            <div className="p-6">
                <div className="mb-4 flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold">
                            注文 #{order.order_number}
                        </h3>
                        <p className="text-sm text-gray-500">
                            {new Date(order.created_at).toLocaleDateString('ja-JP')}
                        </p>
                    </div>
                    <div className="text-right">
                        <OrderStatusBadge status={order.status} />
                        <p className="mt-2 text-lg font-bold text-indigo-600">
                            ¥{order.total_amount.toLocaleString()}
                        </p>
                    </div>
                </div>

                <div className="space-y-2">
                    {order.items.map((item) => (
                        <OrderItemCard key={item.id} item={item} size="sm" />
                    ))}
                </div>

                <div className="mt-4">
                    <Link
                        href={route('orders.show', order.id)}
                        className="text-indigo-600 hover:text-indigo-800"
                    >
                        詳細を見る →
                    </Link>
                </div>
            </div>
        </div>
    );
}


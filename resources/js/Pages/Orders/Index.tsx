import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { PageProps } from '@/types';
import Pagination from '@/Components/Pagination';

// Shared & Local Components
import { Order } from './shared/types';
import { OrderCard, EmptyOrders } from './Index/index';

interface Props extends PageProps {
    orders: {
        data: Order[];
        links: any;
        meta: any;
    };
}

export default function Index({ orders }: Props) {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    注文履歴
                </h2>
            }
        >
            <Head title="注文履歴" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {orders.data.length === 0 ? (
                        <EmptyOrders />
                    ) : (
                        <div className="space-y-4">
                            {orders.data.map((order) => (
                                <OrderCard key={order.id} order={order} />
                            ))}
                        </div>
                    )}

                    <Pagination links={orders.links} className="mt-6" />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { PageProps } from '@/types';
import PrimaryButton from '@/Components/PrimaryButton';
import { useEffect } from 'react';

// Shared & Local Components
import { Order } from './shared/types';
import { OrderItemCard } from './shared/OrderItemCard';
import { PaymentNotices, OrderInfoCard, BillingAddressCard } from './Show/index';

interface Props extends PageProps {
    order: Order;
    paymentSuccess?: boolean;
    emailSent?: boolean;
    stripePaymentStatus?: string | null;
}

export default function Show({ order, paymentSuccess, emailSent, stripePaymentStatus }: Props) {
    // Clean up URL after successful payment redirect
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const paymentIntent = urlParams.get('payment_intent');
        const redirectStatus = urlParams.get('redirect_status');

        if (paymentIntent && redirectStatus === 'succeeded') {
            window.history.replaceState({}, '', window.location.pathname);
        }
    }, []);

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    注文詳細 #{order.order_number}
                </h2>
            }
        >
            <Head title={`注文詳細 #${order.order_number}`} />

            <PaymentNotices
                order={order}
                paymentSuccess={paymentSuccess}
                emailSent={emailSent}
                stripePaymentStatus={stripePaymentStatus}
            />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        {/* Order Items */}
                        <div className="lg:col-span-2">
                            <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                                <div className="p-6">
                                    <h3 className="mb-4 text-lg font-semibold">注文内容</h3>
                                    <div className="space-y-4">
                                        {order.items.map((item) => (
                                            <OrderItemCard key={item.id} item={item} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="lg:col-span-1">
                            <div className="space-y-6">
                                <OrderInfoCard order={order} />

                                {order.billing_address && (
                                    <BillingAddressCard address={order.billing_address} />
                                )}

                                <div className="flex justify-center">
                                    <Link href={route('orders.index')}>
                                        <PrimaryButton>注文一覧に戻る</PrimaryButton>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

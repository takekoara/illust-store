import { Order } from '../shared/types';

interface PaymentNoticesProps {
    order: Order;
    paymentSuccess?: boolean;
    emailSent?: boolean;
    stripePaymentStatus?: string | null;
}

export function PaymentNotices({ order, paymentSuccess, emailSent, stripePaymentStatus }: PaymentNoticesProps) {
    const showNotice = paymentSuccess || (stripePaymentStatus === 'succeeded' && order.status === 'pending');

    if (!showNotice) return null;

    const isPendingButPaid = stripePaymentStatus === 'succeeded' && order.status === 'pending';

    return (
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
            <div className="mb-4 space-y-2">
                {isPendingButPaid ? (
                    <div className="rounded-lg bg-yellow-50 p-4 text-yellow-800">
                        <p className="font-semibold">⚠️ 支払いは完了していますが、注文状態の更新に時間がかかっています</p>
                        <p className="text-sm mt-1">
                            ページをリロードすると、注文状態が自動的に更新されます。
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="rounded-lg bg-green-50 p-4 text-green-800">
                            <p className="font-semibold">✓ 支払いが完了しました！</p>
                        </div>
                        {(emailSent || order.metadata?.email_sent || order.status === 'completed') && (
                            <div className="rounded-lg bg-blue-50 p-4 text-blue-800">
                                <p className="font-semibold">📧 注文確認メールを送信しました</p>
                                <p className="text-sm mt-1">
                                    {order.billing_address?.email || '登録メールアドレス'} に確認メールを送信しました。
                                </p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}


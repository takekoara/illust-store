import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { PageProps } from '@/types';
import DangerButton from '@/Components/DangerButton';

// Custom Hooks
import { useCart } from '@/hooks/useCart';

// Components
import { CartItemCard, OrderSummary, EmptyCart } from './components/index';

interface CartItem {
    id: number;
    product: {
        id: number;
        title: string;
        price: number;
        images: Array<{
            id: number;
            image_path: string;
            is_primary: boolean;
        }>;
        user: {
            id: number;
            name: string;
            username: string;
        };
    };
}

interface Props extends PageProps {
    cartItems: CartItem[];
    total: number;
}

export default function Index({ cartItems, total }: Props) {
    const { removeItem, clearCart, processing } = useCart();

    if (cartItems.length === 0) {
        return (
            <AuthenticatedLayout
                header={
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        ショッピングカート
                    </h2>
                }
            >
                <Head title="ショッピングカート" />
                <div className="py-12">
                    <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                        <EmptyCart />
                    </div>
                </div>
            </AuthenticatedLayout>
        );
    }

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    ショッピングカート
                </h2>
            }
        >
            <Head title="ショッピングカート" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        {/* Cart Items */}
                        <div className="lg:col-span-2">
                            <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                                <div className="p-6">
                                    <div className="mb-4 flex items-center justify-between">
                                        <h3 className="text-lg font-semibold">
                                            カート内の商品 ({cartItems.length})
                                        </h3>
                                        <DangerButton onClick={clearCart} disabled={processing}>
                                            カートを空にする
                                        </DangerButton>
                                    </div>

                                    <div className="space-y-4">
                                        {cartItems.map((item) => (
                                            <CartItemCard
                                                key={item.id}
                                                item={item}
                                                onRemove={removeItem}
                                                processing={processing}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-1">
                            <OrderSummary itemCount={cartItems.length} total={total} />
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

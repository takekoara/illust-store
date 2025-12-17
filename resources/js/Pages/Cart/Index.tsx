import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { PageProps } from '@/types';
import PrimaryButton from '@/Components/PrimaryButton';
import DangerButton from '@/Components/DangerButton';

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

export default function Index({ cartItems, total, auth }: Props) {
    const { delete: destroy, processing } = useForm({});

    const handleRemove = (cartItemId: number) => {
        destroy(route('cart.destroy', cartItemId), {
            preserveScroll: true,
        });
    };

    const handleClear = () => {
        if (confirm('カートを空にしますか？')) {
            router.delete(route('cart.clear'), {
                preserveScroll: true,
            });
        }
    };

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
                    {cartItems.length === 0 ? (
                        <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                            <div className="p-8 text-center">
                                <p className="mb-4 text-gray-500">カートが空です。</p>
                                <Link href={route('products.index')}>
                                    <PrimaryButton>商品を見る</PrimaryButton>
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                            <div className="lg:col-span-2">
                                <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                                    <div className="p-6">
                                        <div className="mb-4 flex items-center justify-between">
                                            <h3 className="text-lg font-semibold">
                                                カート内の商品 ({cartItems.length})
                                            </h3>
                                            <DangerButton
                                                onClick={handleClear}
                                                disabled={processing}
                                            >
                                                カートを空にする
                                            </DangerButton>
                                        </div>

                                        <div className="space-y-4">
                                            {cartItems.map((item) => {
                                                const primaryImage =
                                                    item.product.images.find(
                                                        (img) => img.is_primary
                                                    ) || item.product.images[0];
                                                const imageUrl = primaryImage
                                                    ? `/storage/${primaryImage.image_path}`
                                                    : '/placeholder-image.jpg';

                                                return (
                                                    <div
                                                        key={item.id}
                                                        className="flex gap-4 rounded-lg border p-4"
                                                    >
                                                        <Link
                                                            href={route(
                                                                'products.show',
                                                                item.product.id
                                                            )}
                                                            className="shrink-0"
                                                        >
                                                            <img
                                                                src={imageUrl}
                                                                alt={item.product.title}
                                                                className="h-24 w-24 rounded-lg object-cover"
                                                            />
                                                        </Link>
                                                        <div className="flex flex-1 flex-col justify-between">
                                                            <div>
                                                                <Link
                                                                    href={route(
                                                                        'products.show',
                                                                        item.product.id
                                                                    )}
                                                                    className="font-semibold text-gray-900 hover:text-indigo-600"
                                                                >
                                                                    {item.product.title}
                                                                </Link>
                                                                <p className="text-sm text-gray-500">
                                                                    {item.product.user.username ||
                                                                        item.product.user.name}
                                                                </p>
                                                            </div>
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-lg font-bold text-indigo-600">
                                                                    ¥
                                                                    {item.product.price.toLocaleString()}
                                                                </span>
                                                                <DangerButton
                                                                    onClick={() =>
                                                                        handleRemove(item.id)
                                                                    }
                                                                    disabled={processing}
                                                                    className="text-sm"
                                                                >
                                                                    削除
                                                                </DangerButton>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="lg:col-span-1">
                                <div className="sticky top-4 overflow-hidden bg-white shadow-sm sm:rounded-lg">
                                    <div className="p-6">
                                        <h3 className="mb-4 text-lg font-semibold">
                                            注文概要
                                        </h3>
                                        <div className="mb-4 space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">
                                                    小計 ({cartItems.length}点)
                                                </span>
                                                <span className="font-semibold">
                                                    ¥{total.toLocaleString()}
                                                </span>
                                            </div>
                                            <div className="flex justify-between border-t pt-2">
                                                <span className="text-lg font-semibold">
                                                    合計
                                                </span>
                                                <span className="text-lg font-bold text-indigo-600">
                                                    ¥{total.toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                        <Link
                                            href={route('orders.create')}
                                            className="block w-full"
                                        >
                                            <PrimaryButton className="w-full">
                                                レジに進む
                                            </PrimaryButton>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}


import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link } from '@inertiajs/react';
import { PageProps } from '@/types';
import PrimaryButton from '@/Components/PrimaryButton';

interface Props extends PageProps {
    message?: string;
}

export default function Error404({ auth, message }: Props) {
    const Layout = auth?.user ? AuthenticatedLayout : GuestLayout;

    return (
        <Layout>
            <Head title="ページが見つかりません" />

            <div className="flex min-h-screen items-center justify-center bg-gray-100">
                <div className="text-center">
                    <div className="mb-4 text-6xl font-bold text-indigo-600">404</div>
                    <h1 className="mb-2 text-2xl font-semibold text-gray-900">
                        ページが見つかりません
                    </h1>
                    <p className="mb-6 text-gray-600">
                        {message || 'お探しのページは存在しないか、移動または削除された可能性があります。'}
                    </p>
                    <div className="flex justify-center gap-4">
                        <Link href={route('dashboard')}>
                            <PrimaryButton>ダッシュボードに戻る</PrimaryButton>
                        </Link>
                        <Link href={route('products.index')}>
                            <PrimaryButton>商品一覧に戻る</PrimaryButton>
                        </Link>
                    </div>
                </div>
            </div>
        </Layout>
    );
}


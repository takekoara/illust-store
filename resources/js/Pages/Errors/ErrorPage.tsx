import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link } from '@inertiajs/react';
import { PageProps } from '@/types';
import PrimaryButton from '@/Components/PrimaryButton';

interface ErrorPageProps extends PageProps {
    code: number;
    title: string;
    defaultMessage: string;
    message?: string;
    color?: 'indigo' | 'red';
}

export function ErrorPage({ auth, code, title, defaultMessage, message, color = 'indigo' }: ErrorPageProps) {
    const Layout = auth?.user ? AuthenticatedLayout : GuestLayout;
    const colorClass = color === 'red' ? 'text-red-600' : 'text-indigo-600';

    return (
        <Layout>
            <Head title={title} />

            <div className="flex min-h-screen items-center justify-center bg-gray-100">
                <div className="text-center">
                    <div className={`mb-4 text-6xl font-bold ${colorClass}`}>{code}</div>
                    <h1 className="mb-2 text-2xl font-semibold text-gray-900">
                        {title}
                    </h1>
                    <p className="mb-6 text-gray-600">
                        {message || defaultMessage}
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


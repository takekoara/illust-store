import { Link } from '@inertiajs/react';

export function EmptyBookmarks() {
    return (
        <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
            <div className="p-8 text-center">
                <p className="mb-4 text-gray-500">ブックマークがありません。</p>
                <Link
                    href={route('products.index')}
                    className="inline-block rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                >
                    商品を見る
                </Link>
            </div>
        </div>
    );
}


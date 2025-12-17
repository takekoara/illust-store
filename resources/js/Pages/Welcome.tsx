import { PageProps, ProductListItem, Tag } from '@/types';
import { Head, Link } from '@inertiajs/react';

interface PopularProduct extends ProductListItem {
    likes_count?: number;
    bookmarks_count?: number;
    product_views_count?: number;
}

interface Props extends PageProps {
    canLogin: boolean;
    canRegister: boolean;
    popularProducts: PopularProduct[];
    newProducts: ProductListItem[];
    popularTags: Tag[];
}

export default function Welcome({
    auth,
    canLogin,
    canRegister,
    popularProducts,
    newProducts,
    popularTags,
}: Props) {
    return (
        <>
            <Head title="イラストストア - 高品質なイラストを販売・購入" />
            
            {/* ヒーローセクション */}
            <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>
                
                <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
                    <div className="mx-auto max-w-2xl text-center">
                        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
                            あなたのイラストを
                            <br />
                            <span className="text-yellow-300">世界に届けよう</span>
                        </h1>
                        <p className="mt-6 text-lg leading-8 text-indigo-100">
                            高品質なイラストを販売・購入できるマーケットプレイス。
                            クリエイターとユーザーをつなぐ、新しいイラストの世界へ。
                        </p>
                        <div className="mt-10 flex items-center justify-center gap-x-6">
                            {auth.user ? (
                                <Link
                                    href={route('products.index')}
                                    className="rounded-md bg-white px-6 py-3 text-sm font-semibold text-indigo-600 shadow-sm hover:bg-indigo-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white transition-all duration-200"
                                >
                                    商品を見る
                                </Link>
                            ) : (
                                <>
                                    {canRegister && (
                                        <Link
                                            href={route('register')}
                                            className="rounded-md bg-white px-6 py-3 text-sm font-semibold text-indigo-600 shadow-sm hover:bg-indigo-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white transition-all duration-200"
                                        >
                                            無料で始める
                                        </Link>
                                    )}
                                    {canLogin && (
                                        <Link
                                            href={route('login')}
                                            className="text-sm font-semibold leading-6 text-white hover:text-yellow-300 transition-colors duration-200"
                                        >
                                            ログイン <span aria-hidden="true">→</span>
                                        </Link>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* 人気タグセクション */}
            {popularTags.length > 0 && (
                <div className="bg-white py-12">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">人気のタグ</h2>
                        <div className="flex flex-wrap gap-3">
                            {popularTags.map((tag) => (
                                <Link
                                    key={tag.id}
                                    href={route('products.index', { tag: tag.name })}
                                    className="inline-flex items-center rounded-full bg-indigo-100 px-4 py-2 text-sm font-medium text-indigo-800 hover:bg-indigo-200 transition-colors duration-200"
                                >
                                    #{tag.name}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* 人気商品セクション */}
            {popularProducts.length > 0 && (
                <div className="bg-gray-50 py-16">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-3xl font-bold text-gray-900">人気のイラスト</h2>
                            <Link
                                href={route('products.index')}
                                className="text-indigo-600 hover:text-indigo-800 font-medium transition-colors duration-200"
                            >
                                すべて見る →
                            </Link>
                        </div>
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
                            {popularProducts.map((product) => {
                                const primaryImage = product.images?.find((img) => img.is_primary) || product.images?.[0];
                                return (
                                    <Link
                                        key={product.id}
                                        href={route('products.show', product.id)}
                                        className="group relative overflow-hidden rounded-lg bg-white shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                                    >
                                        {primaryImage ? (
                                            <div className="aspect-square overflow-hidden bg-gray-100">
                                                <img
                                                    src={`/images/${primaryImage.image_path}`}
                                                    alt={product.title}
                                                    className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-300"
                                                />
                                            </div>
                                        ) : (
                                            <div className="aspect-square bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                                                <span className="text-gray-400 text-sm">No Image</span>
                                            </div>
                                        )}
                                        <div className="p-3">
                                            <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
                                                {product.title}
                                            </h3>
                                            <p className="text-lg font-bold text-indigo-600">
                                                ¥{product.price.toLocaleString()}
                                            </p>
                                            {product.user && (
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {product.user.username || product.user.name}
                                                </p>
                                            )}
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* 新着商品セクション */}
            {newProducts.length > 0 && (
                <div className="bg-white py-16">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-3xl font-bold text-gray-900">新着イラスト</h2>
                            <Link
                                href={route('products.index')}
                                className="text-indigo-600 hover:text-indigo-800 font-medium transition-colors duration-200"
                            >
                                すべて見る →
                            </Link>
                        </div>
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
                            {newProducts.map((product) => {
                                const primaryImage = product.images?.find((img) => img.is_primary) || product.images?.[0];
                                return (
                                    <Link
                                        key={product.id}
                                        href={route('products.show', product.id)}
                                        className="group relative overflow-hidden rounded-lg bg-white shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                                    >
                                        {primaryImage ? (
                                            <div className="aspect-square overflow-hidden bg-gray-100">
                                                <img
                                                    src={`/images/${primaryImage.image_path}`}
                                                    alt={product.title}
                                                    className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-300"
                                                />
                                            </div>
                                        ) : (
                                            <div className="aspect-square bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                                                <span className="text-gray-400 text-sm">No Image</span>
                                            </div>
                                        )}
                                        <div className="p-3">
                                            <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
                                                {product.title}
                                            </h3>
                                            <p className="text-lg font-bold text-indigo-600">
                                                ¥{product.price.toLocaleString()}
                                            </p>
                                            {product.user && (
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {product.user.username || product.user.name}
                                                </p>
                                            )}
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* CTAセクション */}
            {!auth.user && (
                <div className="bg-indigo-600">
                    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                        <div className="mx-auto max-w-2xl text-center">
                            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                                今すぐ始めましょう
                            </h2>
                            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-indigo-100">
                                無料でアカウントを作成して、高品質なイラストを販売・購入しましょう。
                            </p>
                            <div className="mt-10 flex items-center justify-center gap-x-6">
                                {canRegister && (
                                    <Link
                                        href={route('register')}
                                        className="rounded-md bg-white px-6 py-3 text-sm font-semibold text-indigo-600 shadow-sm hover:bg-indigo-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white transition-all duration-200"
                                    >
                                        無料で始める
                                    </Link>
                                )}
                                {canLogin && (
                                    <Link
                                        href={route('login')}
                                        className="text-sm font-semibold leading-6 text-white hover:text-yellow-300 transition-colors duration-200"
                                    >
                                        ログイン <span aria-hidden="true">→</span>
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* フッター */}
            <footer className="bg-gray-900 text-white py-12">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col items-center space-y-4">
                        <div className="flex space-x-6">
                            <Link
                                href={route('about')}
                                className="text-gray-400 hover:text-white transition-colors duration-200"
                            >
                                サイトについて
                            </Link>
                        </div>
                        <p className="text-gray-400 text-sm">
                            © 2025 イラストストア. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </>
    );
}

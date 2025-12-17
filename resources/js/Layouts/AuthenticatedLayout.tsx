import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import FlashMessage from '@/Components/FlashMessage';
import { PageProps } from '@/types';
import { Link, usePage, router } from '@inertiajs/react';
import { PropsWithChildren, ReactNode, useState } from 'react';

export default function Authenticated({
    header,
    children,
}: PropsWithChildren<{ header?: ReactNode }>) {
    const page = usePage<PageProps<{ unreadNotificationCount?: number }>>();
    const { auth, unreadNotificationCount = 0 } = page.props;
    const currentUrl = page.url || '';
    const user = auth.user;

    const [showingNavigationDropdown, setShowingNavigationDropdown] =
        useState(false);

    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="border-b border-gray-100 bg-white">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between">
                        <div className="flex flex-1">
                            <div className="flex shrink-0 items-center space-x-4">
                                <Link href={route('welcome')} className="text-xl font-bold text-gray-900 hover:text-indigo-600">
                                    TOP
                                </Link>
                            </div>

                            <div className="hidden sm:-my-px sm:ms-10 sm:flex sm:flex-1 sm:items-center sm:justify-between">
                                <div className="flex space-x-8">
                                {/* 主要機能 */}
                                <NavLink href={route('dashboard')} 
                                active={route().current('dashboard')}
                                >
                                    ダッシュボード
                                </NavLink>
                                <NavLink
                                    href={route('products.index')}
                                    active={route().current('products.*')}
                                >
                                    商品
                                </NavLink>
                                <NavLink
                                    href={route('search.index')}
                                    active={route().current('search.*')}
                                >
                                    検索
                                </NavLink>
                                
                                {/* アクション機能 */}
                                <NavLink
                                    href={route('cart.index')}
                                    active={route().current('cart.*')}
                                >
                                    カート
                                </NavLink>
                                
                                {/* コミュニケーション */}
                                <NavLink
                                    href={route('chat.index')}
                                    active={route().current('chat.*')}
                                >
                                    チャット
                                </NavLink>
                                
                                {/* 個人情報・履歴 */}
                                <NavLink
                                    href={route('orders.index')}
                                    active={route().current('orders.*')}
                                >
                                    購入履歴
                                </NavLink>
                                
                                {/* 管理者機能 */}
                                {user?.is_admin && (
                                    <>
                                        <button
                                            type="button"
                                        onClick={() => router.visit('/products/my-products')}
                                            className={`inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium leading-5 transition duration-150 ease-in-out focus:outline-none ${
                                                currentUrl.startsWith('/products/my-products')
                                                    ? 'border-indigo-400 text-gray-900 focus:border-indigo-700'
                                                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 focus:border-gray-300 focus:text-gray-700'
                                            }`}
                                        >
                                            マイ商品管理
                                        </button>
                                        <button
                                            type="button"
                                        onClick={() => router.visit('/products/create')}
                                            className={`inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium leading-5 transition duration-150 ease-in-out focus:outline-none ${
                                                currentUrl.startsWith('/products/create')
                                                    ? 'border-indigo-400 text-gray-900 focus:border-indigo-700'
                                                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 focus:border-gray-300 focus:text-gray-700'
                                            }`}
                                        >
                                            新規商品作成
                                        </button>
                                    </>
                                )}
                                
                                </div>
                                
                                {/* 通知（右側に配置） */}
                                <div className="relative inline-flex items-center space-x-4">
                                    <NavLink
                                        href={route('notifications.index')}
                                        active={route().current('notifications.*')}
                                    >
                                        通知
                                    </NavLink>
                                    {unreadNotificationCount > 0 && (
                                        <span className="ml-1.5 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-bold text-white leading-none">
                                            {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
                                        </span>
                                    )}
                                    <NavLink
                                        href={route('about')}
                                        active={route().current('about')}
                                    >
                                        サイトについて
                                    </NavLink>
                                </div>
                            </div>
                        </div>

                        <div className="hidden sm:ms-6 sm:flex sm:items-center">
                            <div className="relative ms-3">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <span className="inline-flex rounded-md">
                                            <button
                                                type="button"
                                                className="inline-flex items-center rounded-md border border-transparent bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-500 transition duration-150 ease-in-out hover:text-gray-700 focus:outline-none"
                                            >
                                                {user?.name || 'ゲスト'}

                                                <svg
                                                    className="-me-0.5 ms-2 h-4 w-4"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </button>
                                        </span>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content>
                                        {user ? (
                                            <>
                                                <Dropdown.Link
                                                    href={route('profile.edit')}
                                                >
                                                    プロフィール
                                                </Dropdown.Link>
                                                <Dropdown.Link
                                                    href={route('logout')}
                                                    method="post"
                                                    as="button"
                                                >
                                                    ログアウト
                                                </Dropdown.Link>
                                            </>
                                        ) : (
                                            <>
                                            <Dropdown.Link
                                                href={route('login')}
                                            >
                                                ログイン
                                            </Dropdown.Link>
                                            <Dropdown.Link
                                                href={route('register')}
                                            >
                                                新規登録
                                            </Dropdown.Link>
                                            </>
                                        )}
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>

                        <div className="-me-2 flex items-center sm:hidden">
                            <button
                                onClick={() =>
                                    setShowingNavigationDropdown(
                                        (previousState) => !previousState,
                                    )
                                }
                                className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 transition duration-150 ease-in-out hover:bg-gray-100 hover:text-gray-500 focus:bg-gray-100 focus:text-gray-500 focus:outline-none"
                            >
                                <svg
                                    className="h-6 w-6"
                                    stroke="currentColor"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        className={
                                            !showingNavigationDropdown
                                                ? 'inline-flex'
                                                : 'hidden'
                                        }
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                    <path
                                        className={
                                            showingNavigationDropdown
                                                ? 'inline-flex'
                                                : 'hidden'
                                        }
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                <div
                    className={
                        (showingNavigationDropdown ? 'block' : 'hidden') +
                        ' sm:hidden'
                    }
                >
                    <div className="space-y-1 pb-3 pt-2">
                        {/* 主要機能 */}
                        <ResponsiveNavLink
                            href={route('products.index')}
                            active={route().current('products.*')}
                        >
                            商品
                        </ResponsiveNavLink>
                        <ResponsiveNavLink
                            href={route('search.index')}
                            active={route().current('search.*')}
                        >
                            検索
                        </ResponsiveNavLink>
                        
                        {/* アクション機能 */}
                        <ResponsiveNavLink
                            href={route('cart.index')}
                            active={route().current('cart.*')}
                        >
                            カート
                        </ResponsiveNavLink>
                        
                        {/* コミュニケーション */}
                        <ResponsiveNavLink
                            href={route('chat.index')}
                            active={route().current('chat.*')}
                        >
                            チャット
                        </ResponsiveNavLink>
                        
                        {/* 個人情報・履歴 */}
                        <ResponsiveNavLink
                            href={route('orders.index')}
                            active={route().current('orders.*')}
                        >
                            購入履歴
                        </ResponsiveNavLink>
                        
                        {/* 通知 */}
                        <div className="flex items-center">
                            <ResponsiveNavLink
                                href={route('notifications.index')}
                                active={route().current('notifications.*')}
                            >
                                通知
                            </ResponsiveNavLink>
                            {unreadNotificationCount > 0 && (
                                <span className="ml-2 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-bold text-white leading-none">
                                    {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
                                </span>
                            )}
                        </div>
                        
                        {/* サイトについて */}
                        <ResponsiveNavLink
                            href={route('about')}
                            active={route().current('about')}
                        >
                            サイトについて
                        </ResponsiveNavLink>
                        
                        {/* 管理者機能 */}
                        {user?.is_admin && (
                            <>
                                <button
                                    type="button"
                                    onClick={() => router.visit('/products/my-products')}
                                    className={`flex w-full items-start border-l-4 py-2 pe-4 ps-3 ${
                                        currentUrl.startsWith('/products/my-products')
                                            ? 'border-indigo-400 bg-indigo-50 text-indigo-700 focus:border-indigo-700 focus:bg-indigo-100 focus:text-indigo-800'
                                            : 'border-transparent text-gray-600 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-800 focus:border-gray-300 focus:bg-gray-50 focus:text-gray-800'
                                    } text-base font-medium transition duration-150 ease-in-out focus:outline-none`}
                                >
                                    マイ商品管理
                                </button>
                                <button
                                    type="button"
                                    onClick={() => router.visit('/products/create')}
                                    className={`flex w-full items-start border-l-4 py-2 pe-4 ps-3 ${
                                        currentUrl.startsWith('/products/create')
                                            ? 'border-indigo-400 bg-indigo-50 text-indigo-700 focus:border-indigo-700 focus:bg-indigo-100 focus:text-indigo-800'
                                            : 'border-transparent text-gray-600 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-800 focus:border-gray-300 focus:bg-gray-50 focus:text-gray-800'
                                    } text-base font-medium transition duration-150 ease-in-out focus:outline-none`}
                                >
                                    新規商品作成
                                </button>
                            </>
                        )}
                    </div>

                    <div className="border-t border-gray-200 pb-1 pt-4">
                        <div className="px-4">
                            {user ? (
                                <>
                                    <div className="text-base font-medium text-gray-800">
                                        {user.name}
                                    </div>
                                    <div className="text-sm font-medium text-gray-500">
                                        {user.email}
                                    </div>
                                </>
                            ) : (
                                <div className="text-base font-medium text-gray-800">
                                    ゲスト
                                </div>
                            )}
                        </div>

                        <div className="mt-3 space-y-1">
                            {user ? (
                                <>
                                    <ResponsiveNavLink href={route('profile.edit')}>
                                        プロフィール
                                    </ResponsiveNavLink>
                                    <ResponsiveNavLink
                                        method="post"
                                        href={route('logout')}
                                        as="button"
                                    >
                                        ログアウト
                                    </ResponsiveNavLink>
                                </>
                            ) : (
                                <ResponsiveNavLink href={route('login')}>
                                    ログイン
                                </ResponsiveNavLink>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {header && (
                <header className="bg-white shadow">
                    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                        {header}
                    </div>
                </header>
            )}

            <main>{children}</main>
            <FlashMessage />
        </div>
    );
}

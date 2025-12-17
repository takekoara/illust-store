import { PageProps } from '@/types';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import GuestLayout from '@/Layouts/GuestLayout';
import { PropsWithChildren } from 'react';

interface Props extends PageProps {}

export default function About({ auth }: Props) {
    const Layout = auth.user ? AuthenticatedLayout : GuestLayout;

    const content = (
        <div className="py-12">
            <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                    <div className="p-6 text-gray-900">
                        <Head title="サイトについて" />

                        <div className="space-y-8">
                            {/* タイトル */}
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                    サイトについて
                                </h1>
                                <p className="text-gray-600">
                                    このサイトの利用に関する重要な情報をご確認ください。
                                </p>
                            </div>

                            {/* デモサイトについて */}
                            <section className="border-t border-gray-200 pt-6">
                                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                                    デモサイトについて
                                </h2>
                                <div className="space-y-3 text-gray-700">
                                    <p>
                                        本サイトは<strong className="text-red-600">デモンストレーション用のサイト</strong>です。
                                        実際の商品販売や決済処理は行われません。
                                    </p>
                                    <p>
                                        このサイトは、ポートフォリオとして作成されたものであり、
                                        技術的な実装や機能のデモンストレーションを目的としています。
                                    </p>
                                </div>
                            </section>

                            {/* 商品投稿について */}
                            <section className="border-t border-gray-200 pt-6">
                                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                                    商品投稿について
                                </h2>
                                <div className="space-y-3 text-gray-700">
                                    <p>
                                        本サイトでは、<strong>管理者のみが商品を投稿できる</strong>仕様となっていますが、
                                        デモサイトの性質上、実際には一般ユーザーも商品を投稿できる機能が実装されています。
                                    </p>
                                    <p>
                                        これは、サイトの機能をより広く体験していただくための実装です。
                                        実際の運用では、管理者のみが商品を投稿できるよう制限されます。
                                    </p>
                                </div>
                            </section>

                            {/* 画像の著作権について */}
                            <section className="border-t border-gray-200 pt-6">
                                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                                    画像の著作権について
                                </h2>
                                <div className="space-y-3 text-gray-700">
                                    <p>
                                        本サイトで使用されている画像は、すべて<strong className="text-green-600">著作権フリーの画像</strong>です。
                                    </p>
                                    <p>
                                        デモサイトの性質上、実際の商品画像ではなく、
                                        著作権フリーの画像を使用しています。
                                    </p>
                                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                                        <strong>注意:</strong> 実際の商品を販売する場合は、
                                        適切な著作権の確認と許可を取得してください。
                                    </p>
                                </div>
                            </section>

                            {/* 決済について */}
                            <section className="border-t border-gray-200 pt-6">
                                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                                    決済について
                                </h2>
                                <div className="space-y-3 text-gray-700">
                                    <p>
                                        <strong className="text-red-600">本サイトでは実際の決済は発生しません。</strong>
                                    </p>
                                    <p>
                                        決済機能はStripeのテストモードを使用しており、
                                        実際のクレジットカード決済は行われません。
                                    </p>
                                    <p>
                                        テスト用のカード番号を使用して決済フローを体験できますが、
                                        実際の金額の引き落としは一切発生しません。
                                    </p>
                                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-4">
                                        <p className="text-sm text-yellow-800">
                                            <strong>重要:</strong> テスト用のカード情報を使用してください。
                                            実際のクレジットカード情報は入力しないでください。
                                        </p>
                                    </div>
                                </div>
                            </section>

                            {/* 免責事項 */}
                            <section className="border-t border-gray-200 pt-6">
                                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                                    免責事項
                                </h2>
                                <div className="space-y-3 text-gray-700">
                                    <p>
                                        本サイトはデモンストレーション用のサイトであり、
                                        以下の点について一切の責任を負いかねます：
                                    </p>
                                    <ul className="list-disc list-inside space-y-2 ml-4">
                                        <li>本サイトの利用により生じた損害</li>
                                        <li>本サイトの情報の正確性、完全性、有用性</li>
                                        <li>本サイトの機能の動作保証</li>
                                        <li>本サイトへのアクセス不能やデータの消失</li>
                                        <li>本サイトで使用されている画像やコンテンツの著作権侵害</li>
                                    </ul>
                                    <p className="mt-4">
                                        本サイトの利用は、利用者の自己責任において行ってください。
                                    </p>
                                </div>
                            </section>

                            {/* 技術スタック */}
                            <section className="border-t border-gray-200 pt-6">
                                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                                    技術スタック
                                </h2>
                                <div className="space-y-3 text-gray-700">
                                    <p>
                                        本サイトは以下の技術を使用して構築されています：
                                    </p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <h3 className="font-semibold text-gray-900 mb-2">バックエンド</h3>
                                            <ul className="text-sm space-y-1 text-gray-600">
                                                <li>• Laravel 12</li>
                                                <li>• PHP 8.2+</li>
                                                <li>• MySQL/SQLite</li>
                                                <li>• Stripe API</li>
                                            </ul>
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <h3 className="font-semibold text-gray-900 mb-2">フロントエンド</h3>
                                            <ul className="text-sm space-y-1 text-gray-600">
                                                <li>• React 18</li>
                                                <li>• TypeScript</li>
                                                <li>• Inertia.js</li>
                                                <li>• Tailwind CSS</li>
                                            </ul>
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <h3 className="font-semibold text-gray-900 mb-2">その他</h3>
                                            <ul className="text-sm space-y-1 text-gray-600">
                                                <li>• Laravel Reverb (WebSocket)</li>
                                                <li>• Laravel Queue</li>
                                                <li>• Vite</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* お問い合わせ */}
                            <section className="border-t border-gray-200 pt-6">
                                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                                    お問い合わせ
                                </h2>
                                <div className="space-y-3 text-gray-700">
                                    <p>
                                        本サイトに関するお問い合わせは、GitHubリポジトリのIssuesまたは
                                        プルリクエストを通じてお願いいたします。
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        ポートフォリオサイトのため、対応が遅れる場合があります。
                                        あらかじめご了承ください。
                                    </p>
                                </div>
                            </section>

                            {/* 最終更新日 */}
                            <div className="border-t border-gray-200 pt-6 text-sm text-gray-500">
                                <p>
                                    最終更新日: {new Date().toLocaleDateString('ja-JP', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    if (auth.user) {
        return (
            <AuthenticatedLayout
                header={
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        サイトについて
                    </h2>
                }
            >
                {content}
            </AuthenticatedLayout>
        );
    }

    return (
        <GuestLayout>
            {content}
        </GuestLayout>
    );
}


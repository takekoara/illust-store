import { PageProps } from '@/types';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import GuestLayout from '@/Layouts/GuestLayout';

// Components
import { AboutSection, TestCardInfo, TechStackGrid, DisclaimerList } from './components';

interface Props extends PageProps {}

function AboutContent() {
    return (
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
                            <AboutSection title="デモサイトについて">
                                <p>
                                    本サイトは
                                    <strong className="text-red-600">
                                        デモンストレーション用のサイト
                                    </strong>
                                    です。 実際の商品販売や決済処理は行われません。
                                </p>
                                <p>
                                    このサイトは、ポートフォリオとして作成されたものであり、
                                    技術的な実装や機能のデモンストレーションを目的としています。
                                </p>
                            </AboutSection>

                            {/* 商品投稿について */}
                            <AboutSection title="商品投稿について">
                                <p>
                                    本サイトでは、
                                    <strong>管理者のみが商品を投稿できる</strong>
                                    仕様となっていますが、
                                    デモサイトの性質上、実際には一般ユーザーも商品を投稿できる機能が実装されています。
                                </p>
                                <p>
                                    これは、サイトの機能をより広く体験していただくための実装です。
                                    実際の運用では、管理者のみが商品を投稿できるよう制限されます。
                                </p>
                            </AboutSection>

                            {/* 画像の著作権について */}
                            <AboutSection title="画像の著作権について">
                                <p>
                                    本サイトで使用されている画像は、すべて
                                    <strong className="text-green-600">著作権フリーの画像</strong>
                                    です。
                                </p>
                                <p>
                                    デモサイトの性質上、実際の商品画像ではなく、
                                    著作権フリーの画像を使用しています。
                                </p>
                                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                                    <strong>注意:</strong> 実際の商品を販売する場合は、
                                    適切な著作権の確認と許可を取得してください。
                                </p>
                            </AboutSection>

                            {/* 決済について */}
                            <AboutSection title="決済について">
                                <p>
                                    <strong className="text-red-600">
                                        本サイトでは実際の決済は発生しません。
                                    </strong>
                                </p>
                                <p>
                                    決済機能はStripeのテストモードを使用しており、
                                    実際のクレジットカード決済は行われません。
                                </p>
                                <p>
                                    テスト用のカード番号を使用して決済フローを体験できますが、
                                    実際の金額の引き落としは一切発生しません。
                                </p>
                                <TestCardInfo />
                            </AboutSection>

                            {/* 免責事項 */}
                            <AboutSection title="免責事項">
                                <DisclaimerList />
                            </AboutSection>

                            {/* 技術スタック */}
                            <AboutSection title="技術スタック">
                                <p>本サイトは以下の技術,素材を使用して構築されています：</p>
                                <TechStackGrid />
                            </AboutSection>

                            {/* お問い合わせ */}
                            <AboutSection title="お問い合わせ">
                                <p>
                                    本サイトに関するお問い合わせは、GitHubリポジトリのIssuesまたは
                                    プルリクエストを通じてお願いいたします。
                                </p>
                                <p className="text-sm text-gray-600">
                                    ポートフォリオサイトのため、対応が遅れる場合があります。
                                    あらかじめご了承ください。
                                </p>
                            </AboutSection>

                            {/* 最終更新日 */}
                            <div className="border-t border-gray-200 pt-6 text-sm text-gray-500">
                                <p>
                                    最終更新日:{' '}
                                    {new Date().toLocaleDateString('ja-JP', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function About({ auth }: Props) {
    if (auth.user) {
        return (
            <AuthenticatedLayout
                header={
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        サイトについて
                    </h2>
                }
            >
                <AboutContent />
            </AuthenticatedLayout>
        );
    }

    return (
        <GuestLayout>
            <AboutContent />
        </GuestLayout>
    );
}

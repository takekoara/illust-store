# Illust Store - イラスト販売プラットフォーム

イラストを販売するためのフルスタックWebアプリケーションです。管理者が商品を投稿し、ユーザーが購入できるECサイトです。

## 🎯 プロジェクト概要

このプロジェクトは、Laravel（バックエンド）とReact + TypeScript（フロントエンド）を使用したモダンなECサイトです。Inertia.jsを使用してSPAのような体験を提供しながら、サーバーサイドレンダリングの利点も活用しています。

### 主な特徴

- **管理者専用の商品投稿機能**: 著作権保護のため、管理者のみが商品を投稿可能
- **Stripe決済統合**: 安全なクレジットカード決済
- **リアルタイムチャット**: Laravel Reverbによる商品問い合わせ機能
- **ユーザー認証・認可**: Laravel Breezeによる認証、管理者権限管理
- **レスポンシブデザイン**: モバイル・タブレット・デスクトップ対応
- **画像ギャラリー**: モーダル表示、マウスホイールナビゲーション対応

## 🛠️ 技術スタック

### バックエンド
- **Laravel 12**: PHPフレームワーク
- **PostgreSQL/SQLite**: データベース（本番: PostgreSQL、開発: SQLite）
- **Stripe API**: 決済処理
- **Laravel Reverb**: WebSocketリアルタイム通信
- **Service Layer**: ビジネスロジックの分離

### フロントエンド
- **React 18**: UIライブラリ
- **TypeScript**: 型安全性
- **Inertia.js**: サーバーサイドとフロントエンドのブリッジ
- **Tailwind CSS**: ユーティリティファーストCSS
- **Laravel Echo**: リアルタイムイベント購読
- **@dnd-kit**: ドラッグ&ドロップ機能

### 開発・運用
- **Vite**: ビルドツール
- **PHPUnit**: テストフレームワーク（195テスト）
- **Laravel Pint**: コードスタイル
- **GitHub Actions**: CI/CD
- **Railway**: ホスティング

## ✨ 実装機能

### 認証・認可
- [x] ユーザー登録・ログイン・ログアウト
- [x] パスワードリセット
- [x] 管理者権限管理（`is_admin`フラグ）
- [x] ミドルウェアによるアクセス制御
- [x] Laravel Policiesによる認可

### 商品管理
- [x] 商品の作成・編集・削除（管理者のみ）
- [x] 複数画像のアップロード（AVIF形式で最適化）
- [x] ドラッグ&ドロップによる画像並び替え
- [x] タグ機能
- [x] 商品の有効/無効切り替え
- [x] 商品詳細ページ（画像ギャラリー、モーダル表示）

### ショッピングカート
- [x] カートへの追加・削除
- [x] カート内容の表示
- [x] 合計金額の計算

### 決済機能
- [x] Stripe決済統合（テストモード）
- [x] Payment Intent作成
- [x] 注文詳細ページでの決済状態確認・更新
- [x] 注文履歴の表示

> **Note**: Webhook による非同期ステータス更新は実装済みですが、本番環境では未設定です。代わりに注文詳細ページ表示時にStripe APIで状態を確認し更新します。

### ユーザープロフィール
- [x] プロフィール編集
- [x] アバター選択（3種類から選択）
- [x] フォロー・フォロワー機能
- [x] ユーザープロフィール表示

### ソーシャル機能
- [x] いいね機能
- [x] ブックマーク機能
- [x] リアルタイムチャット（商品問い合わせ）
- [x] 通知機能

### その他
- [x] 検索機能（商品・ユーザー・タグ）
- [x] ダッシュボード（統計情報表示）
- [x] エラーページ（403, 404, 500）
- [x] フラッシュメッセージ（日本語対応）

## 🏗️ アーキテクチャ

```
app/
├── Http/
│   ├── Controllers/     # 薄いコントローラー
│   ├── Middleware/      # 認証・管理者チェック
│   └── Requests/        # バリデーション
├── Services/            # ビジネスロジック層
│   ├── CartService.php
│   ├── ChatService.php
│   ├── DashboardService.php
│   ├── OrderService.php
│   ├── ProductService.php
│   ├── StripeService.php
│   └── ...
├── Models/              # Eloquentモデル
└── Policies/            # 認可ポリシー

resources/js/
├── Components/          # 共通コンポーネント
├── Pages/
│   ├── Products/
│   │   ├── components/  # ページ固有コンポーネント
│   │   ├── shared/      # 共有コンポーネント
│   │   └── *.tsx        # ページ本体
│   └── ...
├── hooks/               # カスタムフック
└── types/               # TypeScript型定義
```

## 📋 セットアップ手順

### 必要な環境
- PHP 8.2以上
- Composer
- Node.js 20以上
- npm

### インストール

```bash
# リポジトリのクローン
git clone https://github.com/ohlmelon/illust-store.git
cd illust-store

# 依存関係のインストール
composer install
npm install

# 環境変数の設定
cp .env.example .env
php artisan key:generate

# データベースのセットアップ（SQLite）
touch database/database.sqlite
php artisan migrate
php artisan db:seed --class=AdminUserSeeder

# アセットのビルド & 開発サーバー起動
npm run dev
php artisan serve
```

### Stripe設定（テストモード）

1. [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys) でテストAPIキーを取得
2. `.env` に設定:
```env
STRIPE_KEY=pk_test_xxxxx
STRIPE_SECRET=sk_test_xxxxx
VITE_STRIPE_KEY=pk_test_xxxxx
```

## 🧪 テスト

```bash
# 全テスト実行（195テスト）
php artisan test

# コードスタイルチェック
vendor/bin/pint --test

# TypeScriptチェック
npx tsc --noEmit
```

## 🔐 セキュリティ

- CSRF保護（Webhook除外）
- XSS対策（自動エスケープ）
- SQLインジェクション対策（Eloquent ORM）
- 認可制御（Policies + Middleware）
- レート制限
- bcryptパスワードハッシュ

## 📝 今後の改善点

- [ ] Stripe Webhook の本番環境設定
- [ ] 商品レビュー機能
- [ ] 商品検索の高度化（全文検索）
- [ ] 多言語対応（i18n）

## 📄 ライセンス

このプロジェクトは個人のポートフォリオ用に作成されました。

## 👤 作成者

ポートフォリオプロジェクト

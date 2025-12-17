# Illust Store - イラスト販売プラットフォーム

イラストを販売するためのフルスタックWebアプリケーションです。管理者が商品を投稿し、ユーザーが購入できるECサイトです。

## 🎯 プロジェクト概要

このプロジェクトは、Laravel（バックエンド）とReact + TypeScript（フロントエンド）を使用したモダンなECサイトです。Inertia.jsを使用してSPAのような体験を提供しながら、サーバーサイドレンダリングの利点も活用しています。

### 主な特徴

- **管理者専用の商品投稿機能**: 著作権保護のため、管理者のみが商品を投稿可能
- **Stripe決済統合**: 安全なクレジットカード決済
- **リアルタイム通知**: 注文完了時の自動メール送信（デモ環境ではログに記録、本番環境では実際に送信）
- **ユーザー認証・認可**: Laravel Breezeによる認証、管理者権限管理
- **レスポンシブデザイン**: モバイル・タブレット・デスクトップ対応
- **画像ギャラリー**: モーダル表示、マウスホイールナビゲーション対応

## 🛠️ 技術スタック

### バックエンド
- **Laravel 11**: PHPフレームワーク
- **MySQL/SQLite**: データベース
- **Stripe API**: 決済処理
- **Laravel Policies**: 認可制御
- **Laravel Notifications**: メール送信

### フロントエンド
- **React 18**: UIライブラリ
- **TypeScript**: 型安全性
- **Inertia.js**: サーバーサイドとフロントエンドのブリッジ
- **Tailwind CSS**: ユーティリティファーストCSS
- **Headless UI**: アクセシブルなUIコンポーネント
- **@dnd-kit**: ドラッグ&ドロップ機能
- **react-dropzone**: ファイルアップロード

### 開発ツール
- **Vite**: ビルドツール
- **PHPUnit**: テストフレームワーク
- **ESLint/TypeScript**: コード品質管理

## ✨ 実装機能

### 認証・認可
- [x] ユーザー登録・ログイン・ログアウト
- [x] パスワードリセット
- [x] 管理者権限管理（`is_admin`フラグ）
- [x] ミドルウェアによるアクセス制御
- [x] Laravel Policiesによる認可

### 商品管理
- [x] 商品の作成・編集・削除（管理者のみ）
- [x] 複数画像のアップロード
- [x] ドラッグ&ドロップによる画像並び替え
- [x] タグ機能
- [x] 商品の有効/無効切り替え
- [x] 商品詳細ページ（画像ギャラリー、モーダル表示）

### ショッピングカート
- [x] カートへの追加・削除
- [x] カート内容の表示

### 決済機能
- [x] Stripe決済統合
- [x] Payment Intent作成
- [x] Webhookによる決済完了処理
- [x] 注文履歴の表示
- [x] 注文詳細ページ

### ユーザープロフィール
- [x] プロフィール編集
- [x] アバター選択（3種類から選択）
- [x] フォロー・フォロワー機能
- [x] ユーザープロフィール表示

### その他
- [x] 検索機能
- [x] ダッシュボード（統計情報表示）
- [x] エラーページ（403, 404, 500）
- [x] フラッシュメッセージ（日本語対応）
- [x] 注文完了時の自動メール送信（デモ環境ではログに記録されます）

## 📋 セットアップ手順

### 必要な環境
- PHP 8.2以上
- Composer
- Node.js 18以上
- npm または yarn

### インストール

1. **リポジトリのクローン**
```bash
git clone <repository-url>
cd illust-store
```

2. **依存関係のインストール**
```bash
# PHP依存関係
composer install

# JavaScript依存関係
npm install
```

3. **環境変数の設定**
```bash
cp .env.example .env
php artisan key:generate
```

`.env`ファイルを編集して、データベース設定を追加：
```env
DB_CONNECTION=sqlite
# または
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=illust_store
DB_USERNAME=root
DB_PASSWORD=
```

4. **データベースのセットアップ**
```bash
# SQLiteの場合
touch database/database.sqlite

# マイグレーション実行
php artisan migrate

# 管理者ユーザーの作成
php artisan db:seed --class=AdminUserSeeder
```

5. **ストレージリンクの作成**
```bash
php artisan storage:link
```

6. **アセットのビルド**
```bash
npm run dev
# または本番環境
npm run build
```

7. **開発サーバーの起動**
```bash
# Laravelサーバー
php artisan serve

# Vite開発サーバー（別ターミナル）
npm run dev
```

### Stripe設定

Stripe決済機能を使用する場合は、`STRIPE_SETUP.md`を参照してください。

### メール設定

**注意**: デモ環境では`MAIL_MAILER=log`が設定されており、メールはログファイルに記録されます。本番環境では`MAIL_MAILER=smtp`などに設定することで実際にメールが送信されます。

メール送信機能を使用する場合は、`MAIL_SETUP.md`を参照してください。

## 🔐 セキュリティ機能

- **CSRF保護**: LaravelのCSRFトークン保護（Webhookエンドポイントは除外）
- **XSS対策**: Bladeテンプレートの自動エスケープ
- **SQLインジェクション対策**: Eloquent ORMによるパラメータバインディング
- **認可制御**: Laravel Policiesとミドルウェアによるアクセス制御
- **レート制限**: ログイン試行のレート制限
- **パスワードハッシュ**: bcryptによるパスワードハッシュ化

## 📁 プロジェクト構造

```
illust-store/
├── app/
│   ├── Http/
│   │   ├── Controllers/     # コントローラー
│   │   ├── Middleware/      # ミドルウェア
│   │   └── Requests/        # フォームリクエスト
│   ├── Models/              # Eloquentモデル
│   ├── Notifications/        # 通知クラス
│   └── Policies/             # 認可ポリシー
├── database/
│   ├── migrations/           # データベースマイグレーション
│   └── seeders/              # シーダー
├── resources/
│   ├── js/
│   │   ├── Components/       # Reactコンポーネント
│   │   ├── Layouts/          # レイアウトコンポーネント
│   │   ├── Pages/            # ページコンポーネント
│   │   └── types/            # TypeScript型定義
│   └── views/                # Bladeテンプレート
├── routes/
│   ├── web.php               # Webルート
│   └── auth.php              # 認証ルート
└── tests/                     # テストファイル
```

## 🧪 テスト

```bash
# 全テスト実行
php artisan test

# 特定のテストファイル
php artisan test --filter=AuthenticationTest
```

## 🚀 デプロイ

### 本番環境での注意点

1. **環境変数の設定**
   - `APP_ENV=production`
   - `APP_DEBUG=false`
   - データベース接続情報
   - Stripe APIキー（本番用）
   - メール設定

2. **最適化**
```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan optimize
```

3. **アセットのビルド**
```bash
npm run build
```

## 📝 今後の改善点

- [ ] リアルタイムチャット機能（WebSocket）
- [ ] リアルタイム通知（Pusher/Soketi）
- [ ] 商品レビュー機能
- [ ] お気に入り機能
- [ ] 商品検索の高度化（全文検索）
- [ ] 画像最適化（リサイズ、圧縮）
- [ ] ユニットテスト・機能テストの追加
- [ ] CI/CDパイプラインの構築
- [ ] 多言語対応（i18n）

## 📄 ライセンス

このプロジェクトは個人のポートフォリオ用に作成されました。

## 👤 作成者

[あなたの名前]

## 🙏 謝辞

- [Laravel](https://laravel.com)
- [React](https://react.dev)
- [Inertia.js](https://inertiajs.com)
- [Stripe](https://stripe.com)

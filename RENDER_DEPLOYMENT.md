# 🚀 Render デプロイガイド

## 概要

このガイドでは、Illust StoreアプリケーションをRenderにデプロイする手順を説明します。

## ⚠️ 重要な注意事項

### 1. ストレージの問題

**Renderのストレージは一時的です。** 再起動するとファイルが消えます。

**解決策**: AWS S3などの外部ストレージを使用する必要があります。

```env
FILESYSTEM_DISK=s3
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=your-bucket-name
```

### 2. データベース

RenderはPostgreSQLを提供しています。MySQLを使用する場合は外部データベースが必要です。

### 3. キュー処理

キュー処理を使用する場合、別のWorkerサービスが必要です。

### 4. Reverb（リアルタイムチャット）

Reverbを使用する場合、別のWorkerサービスが必要です。

## 📋 デプロイ手順

### ステップ1: Renderアカウントの作成

1. [Render](https://render.com)にアクセス
2. アカウントを作成（GitHub連携推奨）

### ステップ2: リポジトリの接続

1. Renderダッシュボードで「New +」→「Web Service」を選択
2. GitHubリポジトリを接続
3. または、`render.yaml`ファイルを使用して自動デプロイを設定

### ステップ3: データベースの作成

1. Renderダッシュボードで「New +」→「PostgreSQL」を選択
2. データベース名を設定（例: `illust_store`）
3. データベースの接続情報をメモ

### ステップ4: 環境変数の設定

Renderダッシュボードの「Environment」セクションで以下を設定：

#### 基本設定
```
APP_ENV=production
APP_DEBUG=false
APP_KEY=base64:...（php artisan key:generateで生成）
APP_URL=https://your-app.onrender.com
```

#### データベース設定（PostgreSQL）
```
DB_CONNECTION=pgsql
DB_HOST=your-db-host.onrender.com
DB_PORT=5432
DB_DATABASE=illust_store
DB_USERNAME=illust_store_user
DB_PASSWORD=your-password
```

#### Stripe設定
```
STRIPE_KEY=pk_live_...
STRIPE_SECRET=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
VITE_STRIPE_KEY=pk_live_...
```

#### メール設定
```
MAIL_MAILER=smtp
MAIL_HOST=smtp.example.com
MAIL_PORT=587
MAIL_USERNAME=your-email
MAIL_PASSWORD=your-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@yourdomain.com
MAIL_FROM_NAME=Illust Store
```

#### AWS S3設定（必須 - ストレージ用）
```
FILESYSTEM_DISK=s3
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=your-bucket-name
```

#### Reverb設定（リアルタイムチャット使用時）
```
BROADCAST_CONNECTION=reverb
REVERB_APP_ID=your-app-id
REVERB_APP_KEY=your-app-key
REVERB_APP_SECRET=your-app-secret
REVERB_HOST=your-app.onrender.com
REVERB_PORT=443
REVERB_SCHEME=https
VITE_REVERB_APP_KEY=your-app-key
VITE_REVERB_HOST=your-app.onrender.com
VITE_REVERB_PORT=443
VITE_REVERB_SCHEME=https
```

### ステップ5: ビルドと起動コマンドの設定

#### ビルドコマンド
```bash
composer install --optimize-autoloader --no-dev &&
npm install &&
npm run build
```

#### 起動コマンド
```bash
php artisan config:cache &&
php artisan route:cache &&
php artisan view:cache &&
php artisan migrate --force &&
php artisan storage:link &&
php -S 0.0.0.0:$PORT -t public
```

### ステップ6: キーワーカーサービスの作成（オプション）

キュー処理を使用する場合：

1. 「New +」→「Background Worker」を選択
2. 同じリポジトリを接続
3. 起動コマンド: `php artisan queue:work --sleep=3 --tries=3 --max-time=3600`
4. 環境変数をWebサービスと同じものを設定

### ステップ7: Reverbサービスの作成（オプション）

リアルタイムチャットを使用する場合：

1. 「New +」→「Background Worker」を選択
2. 同じリポジトリを接続
3. 起動コマンド: `php artisan reverb:start --host=0.0.0.0 --port=$PORT`
4. 環境変数を設定（特に`REVERB_*`）

## 🔧 設定のカスタマイズ

### render.yamlを使用する場合

プロジェクトルートに`render.yaml`ファイルを作成すると、自動的にサービスが作成されます。

```bash
# render.yamlをコミット
git add render.yaml
git commit -m "Add Render configuration"
git push
```

Renderダッシュボードで「New +」→「Blueprint」を選択し、リポジトリを接続すると自動的に設定されます。

## 📝 重要な設定変更

### 1. ストレージをS3に変更

`.env`またはRenderの環境変数で：
```
FILESYSTEM_DISK=s3
```

### 2. データベースをPostgreSQLに変更

`.env`またはRenderの環境変数で：
```
DB_CONNECTION=pgsql
```

### 3. ログをstderrに設定

Renderでは標準エラー出力にログを出力する必要があります：
```
LOG_CHANNEL=stderr
```

## ⚠️ 制限事項

### Renderの無料プラン

- **スピンアップ時間**: 15分間の非アクティブ後にスリープ
- **ストレージ**: 一時的（再起動で消える）
- **データベース**: PostgreSQL（無料プランあり）
- **帯域幅**: 100GB/月

### 推奨事項

- **本番環境**: 有料プラン（$7/月〜）の使用を推奨
- **ストレージ**: AWS S3などの外部ストレージは必須
- **バックアップ**: データベースの自動バックアップを有効化

## 🔍 トラブルシューティング

### 問題1: アプリケーションが起動しない

**解決方法:**
- ログを確認（Renderダッシュボードの「Logs」タブ）
- 環境変数が正しく設定されているか確認
- `APP_DEBUG=true`に一時的に設定してエラーを確認

### 問題2: 画像が表示されない

**解決方法:**
- S3の設定が正しいか確認
- `FILESYSTEM_DISK=s3`が設定されているか確認
- S3バケットのパブリックアクセス設定を確認

### 問題3: データベース接続エラー

**解決方法:**
- データベースの接続情報を確認
- データベースが起動しているか確認
- ファイアウォール設定を確認

### 問題4: キューが処理されない

**解決方法:**
- キーワーカーサービスが起動しているか確認
- `QUEUE_CONNECTION=database`が設定されているか確認
- データベースの`jobs`テーブルが存在するか確認

## 📚 参考リンク

- [Render公式ドキュメント](https://render.com/docs)
- [Laravel on Render](https://render.com/docs/deploy-laravel)
- [AWS S3設定](https://aws.amazon.com/s3/)


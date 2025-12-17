# 🚀 デプロイチェックリスト

## ✅ 必須項目（デプロイ前に完了）

### 1. 環境変数の設定

#### 基本設定
- [ ] `APP_ENV=production`
- [ ] `APP_DEBUG=false`
- [ ] `APP_KEY`が設定されている（`php artisan key:generate`で生成）
- [ ] `APP_URL`が本番環境のURLに設定されている

#### データベース設定
- [ ] `DB_CONNECTION=mysql` または `pgsql`（本番環境ではSQLiteは非推奨）
- [ ] `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`が正しく設定されている
- [ ] データベースが作成されている

#### Stripe設定（決済機能を使用する場合）
- [ ] `STRIPE_KEY`（本番用公開キー: `pk_live_...`）
- [ ] `STRIPE_SECRET`（本番用シークレットキー: `sk_live_...`）
- [ ] `STRIPE_WEBHOOK_SECRET`（本番環境のWebhookシークレット）
- [ ] `VITE_STRIPE_KEY`（フロントエンド用）

#### メール設定
- [ ] `MAIL_MAILER=smtp` または他のメールサービス
- [ ] `MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD`が設定されている
- [ ] `MAIL_FROM_ADDRESS`と`MAIL_FROM_NAME`が設定されている

#### Reverb設定（リアルタイムチャットを使用する場合）
- [ ] `BROADCAST_CONNECTION=reverb`
- [ ] `REVERB_APP_ID`, `REVERB_APP_KEY`, `REVERB_APP_SECRET`が設定されている
- [ ] `REVERB_HOST`, `REVERB_PORT`, `REVERB_SCHEME`が設定されている
- [ ] `VITE_REVERB_APP_KEY`, `VITE_REVERB_HOST`, `VITE_REVERB_PORT`, `VITE_REVERB_SCHEME`が設定されている

### 2. データベースのセットアップ

- [ ] データベースマイグレーション実行
  ```bash
  php artisan migrate --force
  ```
- [ ] 管理者ユーザーの作成（必要に応じて）
  ```bash
  php artisan db:seed --class=AdminUserSeeder
  ```

### 3. ストレージの設定

- [ ] ストレージリンクの作成
  ```bash
  php artisan storage:link
  ```
- [ ] `storage/app/public`ディレクトリのパーミッション確認（755または775）
- [ ] `storage/logs`ディレクトリのパーミッション確認（書き込み可能）

### 4. アセットのビルド

- [ ] フロントエンドアセットのビルド
  ```bash
  npm run build
  ```
- [ ] `public/build`ディレクトリにファイルが生成されていることを確認

### 5. キャッシュの最適化

- [ ] 設定キャッシュ
  ```bash
  php artisan config:cache
  ```
- [ ] ルートキャッシュ
  ```bash
  php artisan route:cache
  ```
- [ ] ビューキャッシュ
  ```bash
  php artisan view:cache
  ```
- [ ] オプティマイズ（上記をまとめて実行）
  ```bash
  php artisan optimize
  ```

### 6. セキュリティ設定

- [ ] `.env`ファイルが`.gitignore`に含まれていることを確認
- [ ] `.env`ファイルに機密情報が含まれていないことを確認（Git履歴に残っていない）
- [ ] `APP_DEBUG=false`が設定されている
- [ ] SSL証明書が設定されている（HTTPS使用時）

### 7. サーバー設定

#### Webサーバー（Apache/Nginx）
- [ ] `public`ディレクトリがドキュメントルートに設定されている
- [ ] `.htaccess`ファイルが有効（Apacheの場合）
- [ ] URLリライトが正しく動作している

#### PHP設定
- [ ] PHP 8.2以上がインストールされている
- [ ] 必要なPHP拡張機能がインストールされている
  - `pdo`, `pdo_mysql`（または`pdo_pgsql`）
  - `mbstring`, `xml`, `openssl`, `json`, `fileinfo`
- [ ] `upload_max_filesize`と`post_max_size`が適切に設定されている（画像アップロード用）

### 8. キュー処理の設定

- [ ] キューワーカーの設定（Supervisor推奨）
  ```bash
  php artisan queue:work --daemon
  ```
- [ ] または、`QUEUE_CONNECTION=sync`（開発環境のみ）

### 9. Reverbサーバーの設定（リアルタイムチャットを使用する場合）

- [ ] Reverbサーバーが常時起動している（Supervisor推奨）
  ```bash
  php artisan reverb:start
  ```
- [ ] ファイアウォールでReverbポート（デフォルト8080）が開放されている
- [ ] 本番環境では`REVERB_SCHEME=https`に設定

### 10. ログとモニタリング

- [ ] ログファイルのローテーション設定
- [ ] エラーログの監視設定
- [ ] アプリケーションのヘルスチェックエンドポイント（`/up`）が動作している

## 🔍 デプロイ後の確認項目

### 機能確認

- [ ] トップページが表示される
- [ ] ユーザー登録・ログインが動作する
- [ ] 商品一覧・詳細ページが表示される
- [ ] カート機能が動作する
- [ ] 決済フローが動作する（Stripeテストモードで確認）
- [ ] メール送信が動作する（テスト送信）
- [ ] リアルタイムチャットが動作する（Reverb使用時）
- [ ] 管理者機能が動作する

### パフォーマンス確認

- [ ] ページ読み込み速度が適切
- [ ] 画像が正しく表示される
- [ ] アセット（CSS/JS）が正しく読み込まれている

### セキュリティ確認

- [ ] HTTPSが有効になっている（本番環境）
- [ ] エラーページ（403, 404, 500）が正しく表示される
- [ ] 管理者以外が商品投稿ページにアクセスできない

## 📝 デプロイコマンド一覧

```bash
# 1. 依存関係のインストール
composer install --optimize-autoloader --no-dev
npm install
npm run build

# 2. 環境変数の設定
# .envファイルを本番環境用に編集

# 3. アプリケーションキーの生成（未設定の場合）
php artisan key:generate

# 4. データベースマイグレーション
php artisan migrate --force

# 5. ストレージリンク
php artisan storage:link

# 6. キャッシュ最適化
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan optimize

# 7. パーミッション設定（Linux/Mac）
chmod -R 755 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache
```

## ⚠️ よくある問題と解決方法

### 問題1: 500エラーが発生する

**解決方法:**
- ログファイルを確認: `storage/logs/laravel.log`
- `APP_DEBUG=true`に一時的に設定してエラー詳細を確認
- パーミッションを確認: `storage`と`bootstrap/cache`が書き込み可能か

### 問題2: 画像が表示されない

**解決方法:**
- `php artisan storage:link`が実行されているか確認
- `public/storage`シンボリックリンクが存在するか確認
- ストレージディレクトリのパーミッションを確認

### 問題3: アセット（CSS/JS）が読み込まれない

**解決方法:**
- `npm run build`が実行されているか確認
- `public/build`ディレクトリにファイルが存在するか確認
- Viteの設定（`vite.config.js`）を確認

### 問題4: データベース接続エラー

**解決方法:**
- `.env`のデータベース設定を確認
- データベースサーバーが起動しているか確認
- ファイアウォール設定を確認

### 問題5: キューが処理されない

**解決方法:**
- キューワーカーが起動しているか確認
- `QUEUE_CONNECTION`の設定を確認
- ログファイルでエラーを確認

## 📚 参考ドキュメント

- [Laravel デプロイメントガイド](https://laravel.com/docs/deployment)
- [Stripe設定ガイド](./STRIPE_SETUP.md)
- [メール設定ガイド](./MAIL_SETUP.md)
- [Reverb設定ガイド](./REVERB_SETUP.md)


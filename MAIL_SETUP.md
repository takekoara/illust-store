# メール送信設定ガイド

## 概要

注文完了時に自動的にメールを送信する機能を実装しました。以下の設定を行ってください。

## 1. メール設定（.envファイル）

`.env`ファイルに以下の設定を追加してください。

### 開発環境（ログに出力）

```env
MAIL_MAILER=log
MAIL_FROM_ADDRESS=noreply@example.com
MAIL_FROM_NAME="${APP_NAME}"
```

### 本番環境（SMTP使用例）

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@example.com
MAIL_FROM_NAME="${APP_NAME}"
```

### その他のメールサービス

#### Mailgun
```env
MAIL_MAILER=mailgun
MAILGUN_DOMAIN=your-domain.com
MAILGUN_SECRET=your-mailgun-secret
MAILGUN_ENDPOINT=api.mailgun.net
MAIL_FROM_ADDRESS=noreply@your-domain.com
MAIL_FROM_NAME="${APP_NAME}"
```

#### SendGrid
```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.sendgrid.net
MAIL_PORT=587
MAIL_USERNAME=apikey
MAIL_PASSWORD=your-sendgrid-api-key
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@example.com
MAIL_FROM_NAME="${APP_NAME}"
```

#### Postmark
```env
MAIL_MAILER=postmark
POSTMARK_TOKEN=your-postmark-token
MAIL_FROM_ADDRESS=noreply@example.com
MAIL_FROM_NAME="${APP_NAME}"
```

## 2. 設定の確認

設定後、以下を実行してください：

```bash
# 設定キャッシュをクリア
php artisan config:clear

# 開発サーバーを再起動
php artisan serve
```

## 3. メール送信のタイミング

メールは以下のタイミングで自動送信されます：

1. **Stripe Webhook経由**: 支払いが成功した際に`PaymentController::handlePaymentSuccess()`で送信
2. **フォールバック**: 注文詳細ページにリダイレクトされた際に、支払いが成功していれば`OrderController::show()`で送信

## 4. メール内容

送信されるメールには以下の情報が含まれます：

- 注文番号
- 注文日時
- 合計金額
- 注文ステータス
- 注文内容（商品名と価格）
- 請求先情報
- 注文詳細ページへのリンク

## 5. キューを使用した非同期送信

現在、通知は`ShouldQueue`インターフェースを実装しているため、キューを使用して非同期に送信されます。

### キュー設定

`.env`ファイルでキュードライバーを設定：

```env
QUEUE_CONNECTION=database
```

または、同期処理（開発環境）：

```env
QUEUE_CONNECTION=sync
```

### キューテーブルの作成（databaseドライバー使用時）

```bash
php artisan queue:table
php artisan migrate
```

### キューワーカーの起動

```bash
php artisan queue:work
```

## 6. テスト

### 開発環境でのテスト

`MAIL_MAILER=log`に設定すると、メールは`storage/logs/laravel.log`に出力されます。

### 実際のメール送信をテスト

1. 注文を完了させる
2. `storage/logs/laravel.log`を確認（`MAIL_MAILER=log`の場合）
3. または、実際のメールボックスを確認（SMTP設定時）

## 7. トラブルシューティング

### メールが送信されない

1. `.env`ファイルの設定を確認
2. `php artisan config:clear`を実行
3. `storage/logs/laravel.log`を確認してエラーをチェック
4. キューを使用している場合、`php artisan queue:work`が実行されているか確認

### Gmailを使用する場合

Gmailを使用するには、アプリパスワードが必要です：

1. Googleアカウントの設定に移動
2. 「セキュリティ」→「2段階認証プロセス」を有効化
3. 「アプリパスワード」を生成
4. 生成されたパスワードを`.env`の`MAIL_PASSWORD`に設定

## 8. カスタマイズ

メールの内容をカスタマイズする場合は、`app/Notifications/OrderCompletedNotification.php`を編集してください。


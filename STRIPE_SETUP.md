# Stripe設定ガイド

## 1. Stripe PHP SDKのインストール

```bash
composer require stripe/stripe-php
```

## 2. .envファイルの設定

`.env`ファイルに以下のStripeキーを追加してください：

```env
# Stripe設定
STRIPE_KEY=pk_test_xxxxxxxxxxxxx  # 公開可能キー（Publishable Key）
STRIPE_SECRET=sk_test_xxxxxxxxxxxxx  # シークレットキー（Secret Key）
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx  # Webhookシークレット（後で設定）

# フロントエンド用（Viteで使用）
VITE_STRIPE_KEY=pk_test_xxxxxxxxxxxxx  # 公開可能キーと同じ
```

## 3. Stripeアカウントの設定

### テストモードでの設定

1. [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)にログイン
2. 「開発者」→「APIキー」から以下を取得：
   - **公開可能キー（Publishable key）**: `pk_test_...`で始まる
   - **シークレットキー（Secret key）**: `sk_test_...`で始まる

### Webhookの設定

#### ローカル開発環境（推奨: Stripe CLIを使用）

ローカル開発環境では、Stripe CLIを使用してWebhookを転送します：

1. **Stripe CLIのインストール**
   - Windows: [Stripe CLI ダウンロード](https://github.com/stripe/stripe-cli/releases)
   - または: `scoop install stripe`（Scoopを使用している場合）

2. **Stripe CLIでログイン**
   ```bash
   stripe login
   ```

3. **Webhookをローカルに転送**
   ```bash
   stripe listen --forward-to localhost:8000/webhook/stripe
   ```

4. **Webhookシークレットを取得**
   - 上記コマンドを実行すると、`whsec_...`で始まるシークレットが表示されます
   - このシークレットを`.env`の`STRIPE_WEBHOOK_SECRET`に設定

5. **イベントをリッスン**
   - デフォルトで`payment_intent.succeeded`と`payment_intent.payment_failed`がリッスンされます

#### 本番環境での設定

本番環境では、Stripe DashboardでWebhookエンドポイントを設定します：

1. [Stripe Dashboard](https://dashboard.stripe.com/test/webhooks)で「Webhookエンドポイントを追加」
2. エンドポイントURL: `https://your-domain.com/webhook/stripe`
3. イベントを選択：
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
4. シグネチャシークレットをコピーして`.env`の`STRIPE_WEBHOOK_SECRET`に設定

### 本番環境での設定

本番環境では、テストキーを本番キー（`pk_live_...`と`sk_live_...`）に置き換えてください。

## 4. 設定の確認

設定後、以下を実行：

```bash
# 設定キャッシュをクリア
php artisan config:clear

# 開発サーバーを再起動
npm run dev
```

## 5. テストカード

Stripeのテストモードでは、以下のカード番号が使用できます：

- **成功**: `4242 4242 4242 4242`
- **3Dセキュア認証が必要**: `4000 0025 0000 3155`
- **失敗**: `4000 0000 0000 0002`

有効期限: 任意の未来の日付（例: `12/34`）
CVC: 任意の3桁（例: `123`）

## 6. トラブルシューティング

### エラー: "No such payment_intent"

- Payment Intentが正しく作成されているか確認
- 注文作成後にPayment Intentを作成するフローを確認

### エラー: "Invalid API Key"

- `.env`ファイルのキーが正しく設定されているか確認
- `php artisan config:clear`を実行

### Webhookが動作しない

**ローカル開発環境の場合：**
- Stripe CLIが実行されているか確認: `stripe listen --forward-to localhost:8000/webhook/stripe`
- Webhookシークレットが正しく設定されているか確認（`whsec_...`で始まる）
- Laravelサーバーが`http://127.0.0.1:8000`で実行されているか確認

**本番環境の場合：**
- WebhookエンドポイントのURLが正しいか確認（`https://your-domain.com/webhook/stripe`）
- `STRIPE_WEBHOOK_SECRET`が正しく設定されているか確認
- Stripe DashboardでWebhookイベントのログを確認

**一般的なトラブルシューティング：**
- `php artisan config:clear`を実行して設定をリロード
- WebhookエンドポイントがCSRF保護から除外されているか確認（`bootstrap/app.php`で設定済み）
- Stripe DashboardでWebhookイベントの送信履歴を確認


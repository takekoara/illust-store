# RenderでStripeを設定する方法

## 問題

ログに以下のエラーが表示される場合：
```
Stripe secret key is not configured
config_services_stripe: {"key":null,"secret":null,"webhook_secret":null}
```

これは、Renderの環境変数にStripeのキーが設定されていないことを意味します。

## 解決方法

### ステップ1: Renderダッシュボードで環境変数を設定

1. [Render Dashboard](https://dashboard.render.com/)にログイン
2. 該当のサービス（`illust-store`）をクリック
3. 左側のメニューから **「Environment」** をクリック
4. **「Add Environment Variable」** をクリック

### ステップ2: 必要な環境変数を追加

以下の環境変数を追加してください：

#### 必須の環境変数

```
STRIPE_KEY=pk_test_xxxxxxxxxxxxx
STRIPE_SECRET=sk_test_xxxxxxxxxxxxx
VITE_STRIPE_KEY=pk_test_xxxxxxxxxxxxx
```

**注意**: 
- `STRIPE_KEY`と`VITE_STRIPE_KEY`は同じ値（公開可能キー）です
- テストキーは`pk_test_...`と`sk_test_...`で始まります
- 本番環境では`pk_live_...`と`sk_live_...`を使用します

#### オプション（Webhookを使用する場合）

```
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

### ステップ3: 環境変数の確認

設定後、以下のように確認できます：

1. Renderダッシュボード → サービス → **「Environment」** タブ
2. 以下の変数が表示されていることを確認：
   - `STRIPE_KEY`
   - `STRIPE_SECRET`
   - `VITE_STRIPE_KEY`

### ステップ4: 再デプロイ

環境変数を設定したら、**「Manual Deploy」** → **「Deploy latest commit」** をクリックして再デプロイしてください。

### ステップ5: ログで確認

再デプロイ後、カートからレジに進むと、ログに以下のように表示されるはずです：

```
Stripe configuration check {"order_id":X,"stripe_secret_set":true,"stripe_secret_length":XX}
Attempting to create Stripe Payment Intent {"order_id":X,"amount":250000,"currency":"jpy"}
Stripe Payment Intent created successfully {"order_id":X,"payment_intent_id":"pi_xxxxx"}
```

## Stripeキーの取得方法

### テストキー（開発用）

1. [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)にログイン
2. **「開発者」** → **「APIキー」** をクリック
3. 以下をコピー：
   - **公開可能キー（Publishable key）**: `pk_test_...`で始まる
   - **シークレットキー（Secret key）**: `sk_test_...`で始まる（「表示」をクリック）

### 本番キー（本番環境用）

1. [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)で**「本番モードに切り替え」**をクリック
2. 同様にキーを取得：
   - **公開可能キー**: `pk_live_...`で始まる
   - **シークレットキー**: `sk_live_...`で始まる

## トラブルシューティング

### 問題1: 環境変数を設定したが、まだエラーが出る

**解決方法**:
1. サービスを再デプロイしてください
2. 環境変数の名前が正しいか確認（大文字小文字を区別）
3. 値に余分なスペースや改行がないか確認

### 問題2: ログに`stripe_secret_set: false`と表示される

**原因**: 環境変数が正しく読み込まれていません

**解決方法**:
1. Renderダッシュボードで環境変数が正しく設定されているか確認
2. サービスを再デプロイ
3. `php artisan config:clear`が起動コマンドに含まれているか確認

### 問題3: ローカルでは動作するが、Renderでは動作しない

**原因**: ローカルの`.env`ファイルには設定されているが、Renderの環境変数には設定されていない

**解決方法**: Renderダッシュボードで環境変数を設定してください。`.env`ファイルの内容はRenderには反映されません。

## 確認コマンド（ローカル）

ローカルでStripeキーが正しく設定されているか確認：

```bash
php artisan tinker
>>> config('services.stripe.secret')
```

`null`が返される場合は、`.env`ファイルに`STRIPE_SECRET`が設定されていません。


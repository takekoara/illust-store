# Render ログ確認ガイド

## Renderログの確認方法

### 1. Renderダッシュボードでログを確認

1. [Render Dashboard](https://dashboard.render.com/)にログイン
2. 該当のサービス（例: `illust-store`）をクリック
3. 左側のメニューから **「Logs」** タブをクリック
4. リアルタイムでログが表示されます

### 2. ログが表示されない場合

#### 原因1: ログチャンネルが正しく設定されていない

Renderでは、ログを標準エラー出力（stderr）に出力する必要があります。

**解決方法**: Renderの環境変数に以下を追加：

```
LOG_CHANNEL=stderr
```

または、`LOG_CHANNEL=stack`のままでも動作しますが、`stderr`の方が確実です。

#### 原因2: ログレベルが高すぎる

**解決方法**: 環境変数に以下を追加：

```
LOG_LEVEL=debug
```

これで、`info`、`warning`、`error`レベルのログがすべて表示されます。

#### 原因3: アプリケーションが起動していない

**確認方法**: 
- Renderダッシュボードの「Events」タブで、最新のデプロイが成功しているか確認
- 「Logs」タブで起動時のエラーがないか確認

### 3. ログを確認するタイミング

#### デプロイ時
- ビルドログ: デプロイ中の「Logs」タブで確認
- 起動ログ: デプロイ完了後の「Logs」タブで確認

#### 実行時
- アプリケーションログ: リアルタイムで「Logs」タブに表示
- エラーログ: `Log::error()`で記録されたログが表示

### 4. Stripeエラーのログを確認する方法

カートからレジに進むときにエラーが発生する場合：

1. **Renderダッシュボード** → **Logs** タブを開く
2. カートからレジに進む操作を実行
3. ログに以下のようなメッセージが表示されるはずです：
   - `Order create method called`
   - `Stripe configuration check`
   - `Attempting to create Stripe Payment Intent`
   - エラーが発生した場合: `Stripe Payment Intent API Error` または `Stripe Payment Intent Error`

### 5. ログが表示されない場合の対処

#### 方法1: 一時的にデバッグモードを有効化

Renderの環境変数に以下を追加：

```
APP_DEBUG=true
LOG_LEVEL=debug
LOG_CHANNEL=stderr
```

**注意**: エラー確認後は必ず`APP_DEBUG=false`に戻してください。

#### 方法2: ログを直接確認

Renderのシェル機能を使用（有料プランのみ）：

1. Renderダッシュボード → サービス → **「Shell」** タブ
2. 以下のコマンドでログを確認：
   ```bash
   tail -f storage/logs/laravel.log
   ```

#### 方法3: ブラウザのコンソールで確認

1. ブラウザの開発者ツール（F12）を開く
2. **「Console」** タブでJavaScriptエラーを確認
3. **「Network」** タブでAPIリクエストのエラーを確認
   - `/orders/create`へのリクエストを確認
   - ステータスコードが500や400の場合、エラーの詳細を確認

### 6. よくあるログの場所

- **ビルドログ**: デプロイ中の「Logs」タブ
- **起動ログ**: デプロイ完了後の「Logs」タブ
- **アプリケーションログ**: 実行中の「Logs」タブ（リアルタイム）
- **Laravelログ**: `storage/logs/laravel.log`（シェルで確認可能）

### 7. ログの検索方法

Renderのログ画面では：
- ログをスクロールして過去のログを確認
- ブラウザの検索機能（Ctrl+F）で特定のキーワードを検索
  - 例: `Stripe`、`Error`、`Order create`など

### 8. 推奨設定

Renderの環境変数に以下を設定することを推奨：

```
LOG_CHANNEL=stderr
LOG_LEVEL=debug
APP_DEBUG=false  # 本番環境ではfalse
```

これにより、すべてのログがRenderの「Logs」タブに表示されます。


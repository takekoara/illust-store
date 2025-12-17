# .envファイルのReverb設定方法

## 開発環境（ローカル）の設定

`.env`ファイルに以下の設定を追加してください：

```env
# Laravel Reverb設定（開発環境）
BROADCAST_CONNECTION=reverb
REVERB_APP_ID=illust-store-app
REVERB_APP_KEY=illust-store-key
REVERB_APP_SECRET=illust-store-secret
REVERB_HOST=localhost
REVERB_PORT=8080
REVERB_SCHEME=http

# フロントエンド用（Viteで使用）
VITE_REVERB_APP_KEY=illust-store-key
VITE_REVERB_HOST=localhost
VITE_REVERB_PORT=8080
VITE_REVERB_SCHEME=http
```

## 設定値の説明

### バックエンド用（必須）

- `BROADCAST_CONNECTION=reverb`: ブロードキャストドライバーをReverbに設定
- `REVERB_APP_ID`: アプリケーションID（任意の文字列、例: `illust-store-app`）
- `REVERB_APP_KEY`: アプリケーションキー（任意の文字列、例: `illust-store-key`）
- `REVERB_APP_SECRET`: アプリケーションシークレット（任意の文字列、例: `illust-store-secret`）
- `REVERB_HOST=localhost`: 開発環境では`localhost`
- `REVERB_PORT=8080`: Reverbサーバーのポート（デフォルト: 8080）
- `REVERB_SCHEME=http`: 開発環境では`http`

### フロントエンド用（必須）

- `VITE_REVERB_APP_KEY`: `REVERB_APP_KEY`と同じ値
- `VITE_REVERB_HOST`: `REVERB_HOST`と同じ値
- `VITE_REVERB_PORT`: `REVERB_PORT`と同じ値
- `VITE_REVERB_SCHEME`: `REVERB_SCHEME`と同じ値

## 本番環境（Render）の設定

### リアルタイムチャットを使う場合

Renderでリアルタイムチャットを使う場合、以下の手順が必要です：

#### ステップ1: Renderダッシュボードで環境変数を設定

1. [Render Dashboard](https://dashboard.render.com/)にログイン
2. **Webサービス**（`illust-store`）をクリック
3. 左側メニューの「Environment」をクリック
4. 以下の環境変数を追加：

```env
BROADCAST_CONNECTION=reverb
REVERB_APP_ID=illust-store-app
REVERB_APP_KEY=illust-store-key
REVERB_APP_SECRET=illust-store-secret
REVERB_HOST=illust-store.onrender.com
REVERB_PORT=443
REVERB_SCHEME=https

VITE_REVERB_APP_KEY=illust-store-key
VITE_REVERB_HOST=illust-store.onrender.com
VITE_REVERB_PORT=443
VITE_REVERB_SCHEME=https
```

**重要**: 
- `REVERB_HOST`は実際のドメイン（例: `illust-store.onrender.com`）に設定
- `REVERB_SCHEME`は`https`に設定
- `REVERB_PORT`は`443`に設定（HTTPSの場合）

#### ステップ2: Reverb Workerサービスの作成

`render.yaml`に既に設定されていますが、手動で作成する場合：

1. Renderダッシュボードで「New +」→「Background Worker」を選択
2. 同じリポジトリを接続
3. 起動コマンド: `php artisan reverb:start --host=0.0.0.0 --port=$PORT`
4. 環境変数をWebサービスと同じものを設定（特に`REVERB_*`と`VITE_REVERB_*`）

#### ステップ3: 再デプロイ

環境変数を設定したら、**WebサービスとReverb Workerサービスの両方を再デプロイ**してください。

### リアルタイムチャットを使わない場合

**設定不要**です。環境変数を設定しなければ、自動的にダミーオブジェクトが使用され、エラーは発生しません。

## 設定後の確認

1. **設定を反映**: `.env`ファイルを保存
2. **設定キャッシュをクリア**（開発環境）:
   ```bash
   php artisan config:clear
   ```
3. **Reverbサーバーを起動**（開発環境）:
   ```bash
   php artisan reverb:start
   ```

## リアルタイムチャットを使わない場合

リアルタイムチャット機能を使わない場合は、**設定不要**です。現在のコードでは、環境変数が設定されていない場合は自動的にダミーオブジェクトを使用するため、エラーは発生しません。

## よくある質問

### Q: 値は何を設定すればいいの？

A: `REVERB_APP_ID`、`REVERB_APP_KEY`、`REVERB_APP_SECRET`は任意の文字列で構いません。例：
- `REVERB_APP_ID=my-app-123`
- `REVERB_APP_KEY=my-key-456`
- `REVERB_APP_SECRET=my-secret-789`

### Q: 開発環境と本番環境で値は変える必要があるの？

A: はい。開発環境では`localhost`と`http`、本番環境では実際のドメインと`https`を使用してください。

### Q: 設定しなくてもエラーが出ないのはなぜ？

A: `echo.ts`で環境変数が設定されていない場合はダミーオブジェクトを使用するため、エラーは発生しません。ただし、リアルタイム機能は動作しません。


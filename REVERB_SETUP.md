# Laravel Reverb リアルタイムチャット設定ガイド

## 1. インストール状況

✅ Laravel Reverb: インストール済み
✅ laravel-echo: インストール済み
✅ pusher-js: インストール済み

## 2. 設定ファイルの作成

以下のコマンドを実行して、Reverbの設定を完了してください：

```bash
php artisan install:broadcasting
```

プロンプトが表示されたら、**`reverb`**を選択してください。

このコマンドで以下が実行されます：
- `.env`にReverbの設定が追加されます
- 必要な設定ファイルが作成されます

## 3. .envファイルの設定

`.env`ファイルに以下の設定が追加されます（`php artisan install:broadcasting`実行後）：

```env
# Laravel Reverb設定
BROADCAST_CONNECTION=reverb
REVERB_APP_ID=your-app-id
REVERB_APP_KEY=your-app-key
REVERB_APP_SECRET=your-app-secret
REVERB_HOST=localhost
REVERB_PORT=8080
REVERB_SCHEME=http

# フロントエンド用（Viteで使用）
VITE_REVERB_APP_KEY="${REVERB_APP_KEY}"
VITE_REVERB_HOST="${REVERB_HOST}"
VITE_REVERB_PORT="${REVERB_PORT}"
VITE_REVERB_SCHEME="${REVERB_SCHEME}"
```

## 4. Reverbサーバーの起動

開発環境では、別のターミナルで以下を実行：

```bash
php artisan reverb:start
```

本番環境では、Supervisorなどのプロセス管理ツールを使用してReverbサーバーを常時起動させます。

## 5. 動作確認

1. **Reverbサーバーを起動**: `php artisan reverb:start`
2. **2つのブラウザ（またはシークレットモード）で異なるユーザーでログイン**
3. **同じ会話を開く**
4. **一方でメッセージを送信**
5. **もう一方のブラウザでリアルタイムにメッセージが表示されることを確認**

## 6. 実装内容

### バックエンド
- ✅ `MessageSent`イベントを作成
- ✅ メッセージ送信時にイベントをブロードキャスト
- ✅ プライベートチャンネル`conversation.{id}`でメッセージを配信
- ✅ チャンネル認証を`routes/channels.php`で実装

### フロントエンド
- ✅ Laravel Echoを設定（`resources/js/echo.ts`）
- ✅ チャット画面でリアルタイムメッセージ受信を実装
- ✅ 新しいメッセージを受信したら自動的に画面に追加

## 7. トラブルシューティング

### エラー: "Connection refused"
- Reverbサーバーが起動しているか確認: `php artisan reverb:start`
- `.env`の`REVERB_HOST`と`REVERB_PORT`が正しいか確認

### エラー: "Authentication failed"
- `routes/channels.php`の認証ロジックを確認
- CSRFトークンが正しく設定されているか確認（`app.blade.php`に`<meta name="csrf-token">`があるか）

### メッセージが表示されない
- ブラウザのコンソールでエラーを確認
- Reverbサーバーのログを確認
- ネットワークタブでWebSocket接続を確認
- `BROADCAST_CONNECTION=reverb`が`.env`に設定されているか確認

## 8. 本番環境での設定

本番環境では：
1. Reverbサーバーを常時起動（Supervisor推奨）
2. HTTPSを使用する場合は`REVERB_SCHEME=https`、`VITE_REVERB_SCHEME=https`を設定
3. ファイアウォールでReverbポート（デフォルト8080）を開放

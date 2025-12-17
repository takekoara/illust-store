# Reverb リアルタイムチャット トラブルシューティング

## 問題: 相手側でリアルタイム更新されない

### 1. Reverbサーバーが起動しているか確認

**別のターミナルで以下を実行：**

```bash
php artisan reverb:start
```

サーバーが起動すると、以下のようなメッセージが表示されます：

```
Starting Reverb server on 0.0.0.0:8080...
```

### 2. ブラウザのコンソールでデバッグログを確認

1. **シークレットウィンドウ（相手側）でブラウザの開発者ツールを開く**（F12）
2. **Consoleタブを開く**
3. **チャットページを開く**
4. **以下のログが表示されることを確認：**
   - `Connecting to channel: conversation.X`
   - `Subscribed to channel: conversation.X`

5. **メッセージを送信した側（通常のウィンドウ）でメッセージを送信**
6. **シークレットウィンドウのコンソールで以下が表示されることを確認：**
   - `Received message: { message: {...} }`

### 3. エラーの確認

コンソールに以下のようなエラーが表示される場合：

- `Channel error:` - チャンネル認証エラー
- `WebSocket connection failed` - Reverbサーバーに接続できていない
- `401 Unauthorized` - 認証エラー

### 4. .envファイルの確認

`.env`ファイルに以下の設定があることを確認：

```env
BROADCAST_CONNECTION=reverb

REVERB_APP_ID=your-app-id
REVERB_APP_KEY=your-app-key
REVERB_APP_SECRET=your-app-secret
REVERB_HOST=localhost
REVERB_PORT=8080
REVERB_SCHEME=http

VITE_REVERB_APP_KEY="${REVERB_APP_KEY}"
VITE_REVERB_HOST="${REVERB_HOST}"
VITE_REVERB_PORT="${REVERB_PORT}"
VITE_REVERB_SCHEME="${REVERB_SCHEME}"
```

### 5. よくある問題と解決方法

#### 問題: Reverbサーバーが起動しない

**解決方法:**
```bash
# 設定を確認
php artisan config:show broadcasting.default

# 設定をクリア
php artisan config:clear
php artisan cache:clear
```

#### 問題: チャンネルに接続できない

**解決方法:**
1. `routes/channels.php`の認証ロジックを確認
2. ログインしていることを確認
3. 会話に参加しているユーザーであることを確認

#### 問題: メッセージは送信されるが、リアルタイム更新されない

**解決方法:**
1. Reverbサーバーが起動していることを確認
2. ブラウザのコンソールでエラーを確認
3. `.env`ファイルの設定を確認
4. `npm run dev`でフロントエンドを再ビルド

### 6. 動作確認手順

1. **ターミナル1**: `php artisan serve`（Laravelサーバー）
2. **ターミナル2**: `php artisan reverb:start`（Reverbサーバー）
3. **ターミナル3**: `npm run dev`（Vite開発サーバー）
4. **ブラウザ1**: 通常のウィンドウでユーザーAでログイン
5. **ブラウザ2**: シークレットウィンドウでユーザーBでログイン
6. **両方のブラウザで同じ会話を開く**
7. **ブラウザ1でメッセージを送信**
8. **ブラウザ2でリアルタイムにメッセージが表示されることを確認**


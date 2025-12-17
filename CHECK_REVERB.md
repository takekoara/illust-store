# Reverbサーバーの起動確認

## 問題: イベントが受信されない

Echoは接続できていますが、メッセージ送信時にイベントが受信されていません。

## 確認手順

### 1. Reverbサーバーが起動しているか確認

**別のターミナルで以下を実行：**

```bash
php artisan reverb:start
```

サーバーが起動すると、以下のようなメッセージが表示されます：

```
Starting Reverb server on 0.0.0.0:8080...
Reverb server started successfully.
```

### 2. Laravelのログを確認

メッセージを送信した後、`storage/logs/laravel.log`を確認してください。

以下のログが表示されることを確認：
```
Broadcasting message {"conversation_id":1,"message_id":X,"user_id":Y}
```

エラーが表示される場合：
```
Broadcast error: ...
```

### 3. ブラウザのコンソールで確認

メッセージを送信した後、シークレットウィンドウのコンソールで以下を確認：

- `📢 Received event on channel:` が表示されるか
- `✅ Received message event:` が表示されるか

### 4. Reverbサーバーのログを確認

Reverbサーバーを起動しているターミナルで、メッセージ送信時にログが表示されることを確認してください。

## よくある問題

### 問題1: Reverbサーバーが起動していない

**症状**: Echoは接続できているが、イベントが受信されない

**解決方法**: 
```bash
php artisan reverb:start
```

### 問題2: ポートが既に使用されている

**症状**: `Address already in use` エラー

**解決方法**: 
`.env`ファイルで`REVERB_PORT`を変更：
```env
REVERB_PORT=8081
```

### 問題3: ブロードキャスト設定が正しくない

**確認方法**:
```bash
php artisan config:show broadcasting.default
```

`reverb`と表示されることを確認。

### 問題4: .envファイルに設定がない

`.env`ファイルに以下が設定されていることを確認：
```env
BROADCAST_CONNECTION=reverb
REVERB_APP_ID=your-app-id
REVERB_APP_KEY=your-app-key
REVERB_APP_SECRET=your-app-secret
REVERB_HOST=localhost
REVERB_PORT=8080
REVERB_SCHEME=http
```

## 動作確認

1. **ターミナル1**: `php artisan serve`
2. **ターミナル2**: `php artisan reverb:start` ← **これが重要！**
3. **ターミナル3**: `npm run dev`
4. **ブラウザ1**: 通常のウィンドウでユーザーAでログイン
5. **ブラウザ2**: シークレットウィンドウでユーザーBでログイン
6. **両方のブラウザで同じ会話を開く**
7. **ブラウザ1でメッセージを送信**
8. **Reverbサーバーのターミナルでログを確認**
9. **ブラウザ2のコンソールで `📢 Received event on channel:` が表示されることを確認**


# Render環境でのReverb（リアルタイムチャット）設定ガイド

## ⚠️ 重要な注意事項

**Renderの無料プランではBackground Workerサービスが利用できない場合があります。**

無料プランでリアルタイムチャットを使う場合、以下の選択肢があります：
1. **有料プランにアップグレード**（推奨）
2. **Webサービス内でReverbサーバーを起動**（非推奨、リソース競合の可能性）
3. **リアルタイムチャットを使わない**（ポーリング方式に変更）

## 問題

WebSocket接続エラーが発生し、リアルタイムチャットが動作しない。

## 解決手順

### ステップ1: Renderダッシュボードで環境変数を設定

#### Webサービス（illust-store）の環境変数

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
- `VITE_REVERB_*`はフロントエンド用で、ビルド時に埋め込まれる

### ステップ2: Reverb Workerサービスの確認

`render.yaml`に既に設定されていますが、手動で作成する場合：

1. Renderダッシュボードで「New +」→「Background Worker」を選択
2. サービス名: `illust-store-reverb`
3. 同じリポジトリを接続
4. 起動コマンド: `php artisan reverb:start --host=0.0.0.0 --port=$PORT`
5. 環境変数を設定（Webサービスと同じものを設定）：

```env
APP_ENV=production
APP_DEBUG=false
BROADCAST_CONNECTION=reverb
REVERB_APP_ID=illust-store-app
REVERB_APP_KEY=illust-store-key
REVERB_APP_SECRET=illust-store-secret
REVERB_HOST=illust-store.onrender.com
REVERB_PORT=443
REVERB_SCHEME=https
```

**注意**: Reverb Workerサービスでは`VITE_REVERB_*`は不要（ビルド時に使用されるため）

### ステップ3: 再デプロイ

1. **Webサービスを再デプロイ**（環境変数を設定した後）
2. **Reverb Workerサービスを再デプロイ**（または起動）

### ステップ4: 動作確認

1. **Reverb Workerサービスのログを確認**
   - Renderダッシュボード → Reverb Workerサービス → 「Logs」タブ
   - `Starting Reverb server on 0.0.0.0:XXXX...` が表示されることを確認

2. **ブラウザのコンソールで確認**
   - 開発者ツール（F12）を開く
   - 「Console」タブを開く
   - チャットページを開く
   - WebSocket接続エラーが解消されているか確認

3. **リアルタイムチャットの動作確認**
   - 2つのブラウザ（またはシークレットモード）で異なるユーザーでログイン
   - 同じ会話を開く
   - 一方でメッセージを送信
   - もう一方のブラウザでリアルタイムにメッセージが表示されることを確認

## よくある問題

### 問題1: Reverb Workerサービスが起動していない

**症状**: WebSocket接続エラーが発生する

**解決方法**:
1. RenderダッシュボードでReverb Workerサービスを確認
2. 「Logs」タブでエラーを確認
3. 環境変数が正しく設定されているか確認
4. サービスを再起動

### 問題2: 環境変数が設定されていない

**症状**: `VITE_REVERB_APP_KEY`が`undefined`になる

**解決方法**:
1. Webサービスの環境変数に`VITE_REVERB_*`を設定
2. **再デプロイ**（環境変数を設定したら必ず再デプロイが必要）

### 問題3: ポートが間違っている

**症状**: 接続は試みるが失敗する

**解決方法**:
- Renderでは`$PORT`環境変数を使用するため、Reverb Workerサービスの起動コマンドで`--port=$PORT`を指定
- `REVERB_PORT`は`443`（HTTPSの場合）に設定

### 問題4: ホストが間違っている

**症状**: 接続先が間違っている

**解決方法**:
- `REVERB_HOST`と`VITE_REVERB_HOST`を実際のドメイン（例: `illust-store.onrender.com`）に設定
- `localhost`や`127.0.0.1`は使用しない

## 確認コマンド

### ローカル環境での確認

```bash
# 設定を確認
php artisan config:show broadcasting.default
# 出力: reverb

# Reverbサーバーを起動
php artisan reverb:start
```

### Render環境での確認

1. **Webサービスのログ**:
   - Renderダッシュボード → Webサービス → 「Logs」タブ
   - エラーがないか確認

2. **Reverb Workerサービスのログ**:
   - Renderダッシュボード → Reverb Workerサービス → 「Logs」タブ
   - `Starting Reverb server...` が表示されることを確認

## トラブルシューティング

### WebSocket接続エラーが続く場合

1. **環境変数を再確認**
   - WebサービスとReverb Workerサービスの両方で環境変数が設定されているか確認
   - `VITE_REVERB_*`はWebサービスのみに設定

2. **再デプロイ**
   - 環境変数を設定したら、必ず再デプロイが必要
   - WebサービスとReverb Workerサービスの両方を再デプロイ

3. **ビルドキャッシュをクリア**
   - Renderダッシュボード → Webサービス → 「Settings」タブ
   - 「Clear build cache」をクリック
   - 再デプロイ

4. **ログを確認**
   - WebサービスとReverb Workerサービスのログを確認
   - エラーメッセージを確認

## 無料プランでの代替案

### オプション1: 有料プランにアップグレード（推奨）

Renderの有料プラン（$7/月〜）では、Background Workerサービスが利用できます。

### オプション2: リアルタイムチャットを使わない（推奨）

環境変数を設定しなければ、自動的にダミーオブジェクトが使用され、エラーは発生しません。チャット機能は動作しますが、リアルタイム更新は行われません（ページをリロードすると更新されます）。

**設定方法**: Renderダッシュボードで、以下の環境変数を**削除**してください：
- `BROADCAST_CONNECTION`
- `REVERB_*`
- `VITE_REVERB_*`

### オプション3: Webサービス内でReverbサーバーを起動（非推奨）

**注意**: この方法は推奨されません。WebサービスとReverbサーバーが同じプロセスで動作するため、リソース競合が発生する可能性があります。

## 推奨設定（有料プランを使用する場合）

### Webサービス（illust-store）

```env
BROADCAST_CONNECTION=reverb
REVERB_APP_ID=tK34wLfZcGCdVF8DgFwuI752XILl1y7v
REVERB_APP_KEY=o0heug5kJmgavxcRVSTDB6eVxRAXTPOV
REVERB_APP_SECRET=lv0gi6JcoH8JcRWY8rWOAahomSVSkTaC3v1OsLxeMEyYsBQB5zbVQut0HESdLPJ0
REVERB_HOST=illust-store.onrender.com
REVERB_PORT=443
REVERB_SCHEME=https

VITE_REVERB_APP_KEY=o0heug5kJmgavxcRVSTDB6eVxRAXTPOV
VITE_REVERB_HOST=illust-store.onrender.com
VITE_REVERB_PORT=443
VITE_REVERB_SCHEME=https
```

**重要**: 
- `REVERB_PORT`と`VITE_REVERB_PORT`は**両方とも`443`**に設定してください（HTTPSの場合）
- 現在、`REVERB_PORT=8080`と`VITE_REVERB_PORT=443`が異なっているため、これを修正してください

### Reverb Workerサービス（illust-store-reverb）

```env
APP_ENV=production
APP_DEBUG=false
BROADCAST_CONNECTION=reverb
REVERB_APP_ID=tK34wLfZcGCdVF8DgFwuI752XILl1y7v
REVERB_APP_KEY=o0heug5kJmgavxcRVSTDB6eVxRAXTPOV
REVERB_APP_SECRET=lv0gi6JcoH8JcRWY8rWOAahomSVSkTaC3v1OsLxeMEyYsBQB5zbVQut0HESdLPJ0
REVERB_HOST=illust-store.onrender.com
REVERB_PORT=443
REVERB_SCHEME=https
```

**注意**: 
- Reverb Workerサービスでは`VITE_REVERB_*`は不要
- `REVERB_PORT`は`443`に設定（HTTPSの場合）
- Workerサービスでは`$PORT`環境変数を使用するため、起動コマンドで`--port=$PORT`を指定


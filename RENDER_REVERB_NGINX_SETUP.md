# Render環境でのReverb（Dockerfile + nginx方式）

## 概要

Background Workerサービスが使えない無料プランでも、Dockerfile + nginxを使用してReverbサーバーをWebサービス内で起動できます。

## アーキテクチャ

```
┌─────────────────────────────────┐
│  Render Web Service (Port 80)   │
│  ┌───────────────────────────┐  │
│  │      nginx (Port 80)      │  │
│  │  ┌──────────┬──────────┐  │  │
│  │  │  PHP     │  Reverb  │  │  │
│  │  │  :8000   │  :8080   │  │  │
│  │  └──────────┴──────────┘  │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘
```

- **nginx**: リバースプロキシ（Port 80）
- **PHP**: Laravelアプリケーション（Port 8000）
- **Reverb**: WebSocketサーバー（Port 8080）
- **supervisor**: プロセス管理

## 利点

✅ Background Workerサービスが不要  
✅ 無料プランでも使える可能性がある  
✅ すべてが1つのコンテナで動作  

## 欠点

⚠️ リソース競合の可能性  
⚠️ 設定が複雑  
⚠️ スケーリングが困難  
⚠️ エラーハンドリングが複雑  

## セットアップ手順

### ステップ1: ファイルの準備

以下のファイルが作成されています：
- `Dockerfile.nginx`: nginx + PHP + Reverbを含むDockerfile
- `docker/nginx.conf`: nginxのメイン設定
- `docker/default.conf`: nginxのサーバー設定（WebSocketプロキシ含む）
- `docker/supervisord.conf`: プロセス管理設定

### ステップ2: render.yamlの変更

**オプションA: render.yamlを使用する場合**

`render.yaml`のWebサービスをDockerfileを使用するように変更：

```yaml
services:
  - type: web
    name: illust-store
    env: docker  # phpからdockerに変更
    plan: starter
    dockerfilePath: ./Dockerfile.nginx  # Dockerfileを指定
    dockerContext: .
    envVars:
      - key: APP_ENV
        value: production
      # ... 他の環境変数
```

**オプションB: Renderダッシュボードで設定する場合**

1. Renderダッシュボード → Webサービス → 「Settings」タブ
2. 「Environment」セクションで「Docker」を選択
3. 「Dockerfile Path」に`Dockerfile.nginx`を指定
4. 「Docker Context」に`.`を指定

### ステップ3: 環境変数の設定

Renderダッシュボードで、Webサービスの環境変数を設定：

```env
BROADCAST_CONNECTION=reverb
REVERB_APP_ID=tK34wLfZcGCdVF8DgFwuI752XILl1y7v
REVERB_APP_KEY=o0heug5kJmgavxcRVSTDB6eVxRAXTPOV
REVERB_APP_SECRET=lv0gi6JcoH8JcRWY8rWOAahomSVSkTaC3v1OsLxeMEyYsBQB5zbVQut0HESdLPJ0
REVERB_HOST=illust-store.onrender.com
REVERB_PORT=8080
REVERB_SCHEME=https

VITE_REVERB_APP_KEY=o0heug5kJmgavxcRVSTDB6eVxRAXTPOV
VITE_REVERB_HOST=illust-store.onrender.com
VITE_REVERB_PORT=443
VITE_REVERB_SCHEME=https
```

**重要**: 
- `REVERB_PORT=8080`: コンテナ内のReverbサーバーのポート（nginxがプロキシする）
- `VITE_REVERB_PORT=443`: クライアント側が接続するポート（nginxがリッスンするポート、または設定しない）
- nginxが外部からのリクエストを`/app/`パスでReverbサーバー（Port 8080）にプロキシ
- **`VITE_REVERB_PORT`は`443`に設定するか、設定しない（デフォルトの443を使用）**

### ステップ4: 再デプロイ

環境変数を設定したら、再デプロイしてください。

## 動作確認

1. **ログを確認**
   - Renderダッシュボード → Webサービス → 「Logs」タブ
   - `Starting Reverb server on 0.0.0.0:8080...` が表示されることを確認
   - `nginx: started` が表示されることを確認

2. **ブラウザのコンソールで確認**
   - 開発者ツール（F12）を開く
   - 「Console」タブを開く
   - チャットページを開く
   - WebSocket接続エラーが解消されているか確認

## トラブルシューティング

### 問題1: nginxが起動しない

**解決方法**:
- `docker/nginx.conf`と`docker/default.conf`の構文を確認
- ログでエラーメッセージを確認

### 問題2: Reverbサーバーが起動しない

**解決方法**:
- supervisorのログを確認: `/var/log/supervisor/reverb.err.log`
- 環境変数が正しく設定されているか確認

### 問題3: WebSocket接続が失敗する

**解決方法**:
- `docker/default.conf`の`/app/`ロケーション設定を確認
- `REVERB_PORT`が`8080`に設定されているか確認

## 注意事項

1. **リソース制限**: 1つのコンテナで3つのプロセス（nginx、PHP、Reverb）が動作するため、リソース使用量が増加します。

2. **スケーリング**: この方法では、水平スケーリングが困難です。複数のインスタンスでReverbサーバーを共有するには、Redisなどの共有ストレージが必要です。

3. **エラーハンドリング**: 1つのプロセスがクラッシュすると、supervisorが自動的に再起動しますが、すべてのプロセスが影響を受ける可能性があります。

4. **パフォーマンス**: 小規模なアプリケーションでは問題ありませんが、大規模なアプリケーションでは、Background Workerサービスを使用することを推奨します。

## 推奨事項

- **小規模なアプリケーション**: この方法で問題ありません
- **中規模以上のアプリケーション**: 有料プランにアップグレードしてBackground Workerサービスを使用することを推奨
- **本番環境**: 可能であれば、Background Workerサービスを使用することを推奨


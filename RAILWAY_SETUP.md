# Railway デプロイ手順

## 1. Railwayアカウント作成・ログイン

https://railway.app でアカウント作成

## 2. 新しいプロジェクト作成

1. "New Project" をクリック
2. "Deploy from GitHub repo" を選択
3. `ohlmelon/illust-store` リポジトリを選択

## 3. 環境変数を設定

Railwayダッシュボードの "Variables" タブで以下を設定：

### 必須
```
APP_NAME=イラストショップ
APP_ENV=production
APP_DEBUG=false
APP_KEY=base64:xxxxxxxx（既存のキーを使用）
APP_URL=https://あなたのアプリ.up.railway.app

DB_CONNECTION=pgsql
DB_HOST=（RailwayのPostgreSQLホスト）
DB_PORT=5432
DB_DATABASE=（データベース名）
DB_USERNAME=（ユーザー名）
DB_PASSWORD=（パスワード）

SESSION_DRIVER=database
SESSION_SECURE_COOKIE=true
SESSION_SAME_SITE=lax
```

### Stripe
```
STRIPE_KEY=pk_test_xxxx
STRIPE_SECRET=sk_test_xxxx
VITE_STRIPE_KEY=pk_test_xxxx
```

### Reverb（リアルタイムチャット用）
```
BROADCAST_CONNECTION=reverb
REVERB_APP_ID=your-app-id
REVERB_APP_KEY=your-app-key
REVERB_APP_SECRET=your-app-secret
REVERB_HOST=あなたのアプリ.up.railway.app
REVERB_PORT=443
REVERB_SCHEME=https

VITE_REVERB_APP_KEY=your-app-key
VITE_REVERB_HOST=あなたのアプリ.up.railway.app
VITE_REVERB_PORT=443
VITE_REVERB_SCHEME=https
```

## 4. PostgreSQLデータベースを追加

1. プロジェクト内で "New" → "Database" → "Add PostgreSQL"
2. 作成されたDB接続情報を環境変数に設定

## 5. デプロイ

環境変数設定後、自動でデプロイが開始されます。

## 6. カスタムドメイン（オプション）

1. "Settings" → "Domains"
2. "Generate Domain" または カスタムドメインを追加

## トラブルシューティング

### ビルドエラー
- "Logs" タブでエラー詳細を確認
- 環境変数が正しく設定されているか確認

### 500エラー
- `APP_KEY` が設定されているか確認
- データベース接続情報が正しいか確認
- "Logs" でLaravelのエラーログを確認

### WebSocket接続エラー
- `VITE_REVERB_HOST` がRailwayのドメインと一致しているか確認
- `VITE_REVERB_PORT=443` であることを確認


# Render 500エラー解決ガイド

## 500エラーの主な原因

### 1. APP_KEYが設定されていない（最も可能性が高い）

**症状**: 500エラーが発生する

**解決方法**:
1. ローカルで`APP_KEY`を生成：
   ```bash
   php artisan key:generate --show
   ```
2. 生成されたキーをRenderダッシュボードの環境変数`APP_KEY`に設定
3. サービスを再デプロイ

### 2. データベース接続エラー

**症状**: データベース関連のエラーがログに表示される

**確認事項**:
- `DB_CONNECTION=pgsql`が設定されているか
- `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`が正しく設定されているか
- または`DATABASE_URL`が正しく設定されているか

**注意**: `DATABASE_URL`と個別の`DB_*`変数の両方が設定されている場合、`DATABASE_URL`が優先されます。

### 3. マイグレーションが実行されていない

**症状**: テーブルが存在しないエラー

**解決方法**:
- Dockerfileの起動コマンドで自動実行されますが、手動で実行する場合：
  ```bash
  php artisan migrate --force
  ```

### 4. ストレージ権限の問題

**症状**: ファイル書き込みエラー

**解決方法**:
- Dockerfileで既に設定されていますが、問題がある場合：
  ```bash
  chmod -R 775 storage bootstrap/cache
  ```

## 環境変数の確認リスト

### 必須の環境変数

```env
# アプリケーション基本設定（必須）
APP_ENV=production
APP_DEBUG=false
APP_KEY=base64:...（必須！）
APP_URL=https://illust-store.onrender.com

# データベース設定（必須）
DB_CONNECTION=pgsql
DB_HOST=your-db-host.onrender.com
DB_PORT=5432
DB_DATABASE=illust_store
DB_USERNAME=illust_store_user
DB_PASSWORD=your-password

# または、DATABASE_URLを使用する場合
DATABASE_URL=postgresql://user:password@host:port/database
```

**重要**: `DATABASE_URL`を使用する場合、個別の`DB_HOST`、`DB_PORT`などは不要です。

## トラブルシューティング手順

### ステップ1: ログを確認

Renderダッシュボードの**Logs**タブで、具体的なエラーメッセージを確認してください。

### ステップ2: APP_KEYを生成して設定

```bash
# ローカルで実行
php artisan key:generate --show
```

出力例：
```
base64:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

この値をRenderの環境変数`APP_KEY`に設定してください。

### ステップ3: データベース接続を確認

環境変数が正しく設定されているか確認：

- `DB_CONNECTION=pgsql`が設定されているか
- データベースの接続情報が正しいか
- データベースが起動しているか

### ステップ4: 一時的にデバッグモードを有効化

エラーの詳細を確認するため、一時的に：

```env
APP_DEBUG=true
```

**注意**: エラー確認後は必ず`APP_DEBUG=false`に戻してください。

### ステップ5: 再デプロイ

環境変数を設定したら、サービスを再デプロイしてください。

## よくあるエラーメッセージと解決方法

### "No application encryption key has been specified"
→ `APP_KEY`を設定してください

### "SQLSTATE[HY000] [2002] Connection refused"
→ データベースの接続情報を確認してください

### "SQLSTATE[3D000] [7] FATAL: database does not exist"
→ データベース名が正しいか確認してください

### "SQLSTATE[08006] [7] FATAL: password authentication failed"
→ データベースのパスワードが正しいか確認してください


# Render データベース設定ガイド

## 500エラーの原因と解決方法

### よくある原因

1. **データベース接続エラー**
   - データベースがまだ作成されていない
   - 接続情報が正しく設定されていない
   - データベースのマイグレーションが実行されていない

2. **環境変数の設定不足**
   - `APP_KEY`が設定されていない
   - データベース接続情報が不足している

3. **権限の問題**
   - ストレージディレクトリの書き込み権限がない

## データベース作成後の設定手順

### ステップ1: データベース接続情報の確認

Renderダッシュボードで、作成したPostgreSQLデータベースの接続情報を確認：

- **Internal Database URL**: 内部接続用（同じRenderアカウント内）
- **External Database URL**: 外部接続用

### ステップ2: 環境変数の設定

RenderダッシュボードのWebサービス（またはDockerサービス）の**Environment**セクションで以下を設定：

#### 必須の環境変数

```env
# アプリケーション基本設定
APP_ENV=production
APP_DEBUG=false
APP_KEY=base64:...（php artisan key:generateで生成）
APP_URL=https://your-app.onrender.com

# データベース設定（PostgreSQL）
DB_CONNECTION=pgsql
DB_HOST=your-db-host.onrender.com
DB_PORT=5432
DB_DATABASE=illust_store
DB_USERNAME=illust_store_user
DB_PASSWORD=your-password
```

**重要**: データベースURLを使用する場合：

```env
DB_URL=postgresql://user:password@host:port/database
```

この場合、個別の`DB_HOST`、`DB_PORT`などは不要です。

### ステップ3: マイグレーションの実行

データベースが作成されたら、マイグレーションを実行する必要があります。

#### 方法1: Dockerfileの起動コマンドで自動実行（推奨）

現在のDockerfileには既に含まれています：
```dockerfile
CMD php artisan optimize && \
    php artisan migrate --force && \
    php artisan storage:link || true && \
    php -S 0.0.0.0:${PORT:-8000} -t public
```

#### 方法2: 手動で実行

Renderダッシュボードの**Shell**タブから：
```bash
php artisan migrate --force
```

### ステップ4: ストレージ権限の確認

ストレージディレクトリに書き込み権限があるか確認：

```bash
chmod -R 775 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache
```

Dockerfileには既に含まれていますが、問題がある場合は確認してください。

## トラブルシューティング

### エラー: "SQLSTATE[HY000] [2002] Connection refused"

**原因**: データベースホストが正しくない、またはデータベースが起動していない

**解決方法**:
1. データベースの接続情報を再確認
2. データベースが起動しているか確認（Renderダッシュボードで確認）
3. 内部接続を使用している場合、`DB_HOST`が正しいか確認

### エラー: "SQLSTATE[08006] [7] FATAL: password authentication failed"

**原因**: データベースのユーザー名またはパスワードが正しくない

**解決方法**:
1. データベースの接続情報を再確認
2. パスワードに特殊文字が含まれている場合、エスケープが必要な場合があります

### エラー: "SQLSTATE[3D000] [7] FATAL: database does not exist"

**原因**: データベース名が正しくない、またはデータベースが作成されていない

**解決方法**:
1. データベース名を確認
2. Renderダッシュボードでデータベースが作成されているか確認

### エラー: "No application encryption key has been specified"

**原因**: `APP_KEY`が設定されていない

**解決方法**:
1. ローカルで生成：
   ```bash
   php artisan key:generate --show
   ```
2. 生成されたキーをRenderの環境変数`APP_KEY`に設定

## データベース接続のテスト

環境変数が正しく設定されたら、以下のコマンドで接続をテストできます：

```bash
php artisan tinker
>>> DB::connection()->getPdo();
```

接続が成功すれば、PDOオブジェクトが返されます。

## 次のステップ

1. データベースが作成されたら、上記の環境変数を設定
2. サービスを再デプロイ
3. ログを確認してエラーがないか確認
4. アプリケーションにアクセスして動作確認


# Render デプロイコマンド設定

## Build Command（ビルドコマンド）

Renderダッシュボードの「Build Command」に以下を設定：

```bash
composer install --optimize-autoloader --no-dev && npm install && npm run build
```

### 説明
- `composer install --optimize-autoloader --no-dev`: PHP依存関係をインストール（開発依存関係は除外、オートローダーを最適化）
- `npm install`: JavaScript依存関係をインストール
- `npm run build`: フロントエンドアセットをビルド（TypeScript、React、Tailwind CSSをコンパイル）

---

## Start Command（起動コマンド）

Renderダッシュボードの「Start Command」に以下を設定：

```bash
php artisan config:cache && php artisan route:cache && php artisan view:cache && php artisan migrate --force && php artisan storage:link && php -S 0.0.0.0:$PORT -t public
```

### 説明
1. `php artisan config:cache`: 設定ファイルをキャッシュ（パフォーマンス向上）
2. `php artisan route:cache`: ルートをキャッシュ（パフォーマンス向上）
3. `php artisan view:cache`: ビューをキャッシュ（パフォーマンス向上）
4. `php artisan migrate --force`: データベースマイグレーション実行（本番環境用）
5. `php artisan storage:link`: ストレージシンボリックリンク作成（画像表示用）
6. `php -S 0.0.0.0:$PORT -t public`: PHP組み込みサーバーでアプリケーション起動

---

## 注意事項

### Build Commandについて
- `--no-dev`フラグで開発依存関係を除外（本番環境では不要）
- `--optimize-autoloader`でオートローダーを最適化（パフォーマンス向上）
- `npm run build`でフロントエンドを本番用にビルド

### Start Commandについて
- `$PORT`はRenderが自動的に設定する環境変数（変更不要）
- `--force`フラグは本番環境でのマイグレーション実行に必要
- キャッシュコマンドは本番環境でのパフォーマンス向上のため必須

### エラーが発生する場合

#### ビルドエラー
- `composer install`が失敗する場合: PHPバージョンを確認（PHP 8.2以上が必要）
- `npm install`が失敗する場合: Node.jsバージョンを確認（Node.js 18以上が必要）

#### 起動エラー
- データベース接続エラー: `.env`のデータベース設定を確認
- ストレージリンクエラー: 通常は無視しても問題ありません（S3使用時）
- マイグレーションエラー: データベースが正しく作成されているか確認

---

## 代替案（シンプル版）

### 最小限のBuild Command
```bash
npm install && npm run build
```
※ ComposerはRenderが自動的に実行する場合があります

### 最小限のStart Command
```bash
php artisan migrate --force && php artisan storage:link && php -S 0.0.0.0:$PORT -t public
```
※ キャッシュは後で手動で実行可能

---

## render.yamlを使用する場合

`render.yaml`ファイルを使用している場合、上記のコマンドは自動的に適用されます。
Renderダッシュボードで「New +」→「Blueprint」を選択し、リポジトリを接続すると自動設定されます。


# Render デプロイ トラブルシューティング

## エラーコード127: コマンドが見つからない

### 原因
- コマンドのパスが正しくない
- 必要なツールがインストールされていない
- コマンドの構文エラー

### 解決方法

#### 1. Build Commandの確認

Renderダッシュボードで以下を設定：

```bash
composer install --optimize-autoloader --no-dev && npm install && npm run build
```

**注意**: 複数行形式（`|`）ではなく、1行で記述してください。

#### 2. Start Commandの確認

```bash
php artisan config:cache && php artisan route:cache && php artisan view:cache && php artisan migrate --force && php artisan storage:link && php -S 0.0.0.0:$PORT -t public
```

#### 3. 代替案: シンプルなコマンド

もし上記で失敗する場合、段階的に実行：

**Build Command（最小限）:**
```bash
npm install && npm run build
```

**Start Command（最小限）:**
```bash
php artisan migrate --force && php -S 0.0.0.0:$PORT -t public
```

#### 4. render.yamlを使用しない場合

Renderダッシュボードで直接設定する場合：

1. **Settings** → **Build Command** に上記のコマンドを設定
2. **Settings** → **Start Command** に上記のコマンドを設定
3. **Save Changes** をクリック

#### 5. 環境変数の確認

以下の環境変数が設定されているか確認：

- `APP_KEY` - 必須
- `APP_URL` - 必須
- `DB_*` - データベース接続情報
- `STRIPE_*` - Stripe APIキー（使用する場合）

#### 6. ログの確認

Renderダッシュボードの **Logs** タブで詳細なエラーメッセージを確認してください。

---

## よくある問題と解決方法

### 問題1: "composer: command not found"

**解決方法**: Renderは自動的にComposerをインストールしますが、明示的にパスを指定する場合：

```bash
/usr/local/bin/composer install --optimize-autoloader --no-dev
```

### 問題2: "npm: command not found"

**解決方法**: Node.jsのバージョンを確認。Renderは自動的にNode.jsをインストールしますが、明示的にパスを指定する場合：

```bash
/usr/bin/npm install && /usr/bin/npm run build
```

### 問題3: "php artisan: command not found"

**解決方法**: PHPのパスを確認：

```bash
/usr/bin/php artisan migrate --force
```

### 問題4: マイグレーションエラー

**解決方法**: データベースが正しく作成されているか確認。また、`--force`フラグが必要です。

### 問題5: ストレージリンクエラー

**解決方法**: S3を使用する場合は、このエラーは無視しても問題ありません。エラーを回避する場合：

```bash
php artisan storage:link || true
```

---

## 推奨される設定

### Build Command（推奨）
```bash
composer install --optimize-autoloader --no-dev && npm ci && npm run build
```

`npm ci`は`npm install`より高速で、本番環境に適しています。

### Start Command（推奨）
```bash
php artisan optimize && php artisan migrate --force && php artisan storage:link || true && php -S 0.0.0.0:$PORT -t public
```

`php artisan optimize`は`config:cache`、`route:cache`、`view:cache`をまとめて実行します。

---

## デプロイ前の確認事項

- [ ] `.env.example`が存在する
- [ ] `composer.json`が存在する
- [ ] `package.json`が存在する
- [ ] `vite.config.js`が存在する
- [ ] `public/index.php`が存在する
- [ ] 環境変数が正しく設定されている


# Render デプロイ 最終設定ガイド

## 現在の推奨設定

### Build Command（Renderダッシュボードで設定）

```bash
curl -sS https://getcomposer.org/installer | php && php composer.phar install --optimize-autoloader --no-dev && NPM_CMD=$(which npm || echo npm) && $NPM_CMD ci && $NPM_CMD run build
```

### Start Command（Renderダッシュボードで設定）

```bash
PHP_CMD=$(which php || echo php) && $PHP_CMD artisan optimize && $PHP_CMD artisan migrate --force && $PHP_CMD artisan storage:link || true && $PHP_CMD -S 0.0.0.0:$PORT -t public
```

---

## 127エラーコードのトラブルシューティング

### 問題1: `composer: command not found`

**解決方法**: Composerを明示的にインストール
```bash
curl -sS https://getcomposer.org/installer | php && php composer.phar install ...
```

### 問題2: `npm: command not found`

**解決方法**: npmのパスを自動検出
```bash
NPM_CMD=$(which npm || echo npm) && $NPM_CMD ci && $NPM_CMD run build
```

### 問題3: `php: command not found`

**解決方法**: PHPのパスを自動検出
```bash
PHP_CMD=$(which php || echo php) && $PHP_CMD artisan ...
```

### 問題4: `nuxt: Permission denied` または `command not found`（Node.jsコマンド）

**原因**: `node_modules`がインストールされていない、または実行権限がない

**解決方法**: 
1. `npm ci`または`npm install`がBuild Commandに含まれているか確認
2. 現在のBuild Commandには`npm ci`が含まれているため、通常は問題ありません
3. もしエラーが出る場合、Build Commandを確認：
   ```bash
   npm ci && npm run build
   ```

**注意**: `git clone`したリポジトリでは、`node_modules`は`.gitignore`に含まれているため、必ず`npm install`または`npm ci`を実行する必要があります。

---

## 環境変数の追加（オプション）

一部のビルドエラーを回避するため、以下の環境変数をRenderダッシュボードで設定できます：

- `CI=false` - CI環境での厳格なチェックを無効化
- `NODE_ENV=production` - 本番環境として設定

---

## ローカルでの事前ビルド（代替案）

もしRenderでの自動ビルドが続けて失敗する場合：

1. **ローカルでビルド**:
   ```bash
   npm run build
   ```

2. **ビルド成果物をコミット**:
   ```bash
   git add public/build
   git commit -m "Add pre-built assets"
   git push
   ```

3. **Build Commandを簡略化**:
   ```bash
   curl -sS https://getcomposer.org/installer | php && php composer.phar install --optimize-autoloader --no-dev
   ```

**注意**: この方法は、ビルド成果物をリポジトリに含める必要があるため、通常は推奨されません。

---

## デプロイ前の確認事項

- [ ] `.env.example`が存在する
- [ ] `composer.json`が存在する
- [ ] `package.json`が存在する
- [ ] `vite.config.js`が存在する
- [ ] `public/index.php`が存在する
- [ ] 環境変数が正しく設定されている（APP_KEY、APP_URL、DB_*など）

---

## よくあるエラーと解決方法

### エラー: "command not found"
→ コマンドのフルパスを指定するか、`which`でパスを検出

### エラー: "No such file or directory"
→ ファイルパスが正しいか確認

### エラー: "Permission denied"
→ ファイルの実行権限を確認

### エラー: "Build failed"
→ ログを詳細に確認し、具体的なエラーメッセージを特定

---

## サポート

問題が解決しない場合：
1. Renderダッシュボードの**Logs**タブで詳細なエラーログを確認
2. Renderの公式ドキュメントを参照
3. Renderのサポートに問い合わせ


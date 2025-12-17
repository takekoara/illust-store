# Renderダッシュボードでの設定方法

## 重要: render.yaml vs ダッシュボード設定

Renderでは、**手動で作成したサービス**の場合、ダッシュボードの設定が`render.yaml`より優先されます。
`render.yaml`の設定を反映させるには、**Blueprint**からサービスを作成する必要があります。

## ダッシュボードで直接設定する方法

### ステップ1: サービスに移動

1. Renderダッシュボードにログイン
2. 該当のWebサービス（`illust-store`）を選択
3. **Settings**タブをクリック

### ステップ2: Start Commandを更新

**Start Command**フィールドに以下をコピー＆ペースト（推奨 - パス自動検出）：

```bash
PHP_CMD=$(which php || echo php) && $PHP_CMD artisan optimize && $PHP_CMD artisan migrate --force && $PHP_CMD artisan storage:link || true && $PHP_CMD -S 0.0.0.0:$PORT -t public
```

このコマンドは、PHPのパスを自動的に検出するため、環境に依存しません。

### ステップ3: Build Commandを更新

**Build Command**フィールドに以下をコピー＆ペースト：

```bash
/usr/local/bin/composer install --optimize-autoloader --no-dev && /usr/bin/npm ci && /usr/bin/npm run build
```

**注意**: もし`/usr/local/bin/composer`が正しくない場合、以下のコマンドでComposerのパスを自動検出：

```bash
COMPOSER_CMD=$(which composer || echo composer) && $COMPOSER_CMD install --optimize-autoloader --no-dev && /usr/bin/npm ci && /usr/bin/npm run build
```

### ステップ4: 保存

1. **Save Changes**ボタンをクリック
2. 自動的に再デプロイが開始されます

---

## 代替案: PHPパスの自動検出

もし`/usr/bin/php`が正しくない場合、以下のコマンドでPHPのパスを自動検出します：

```bash
PHP_CMD=$(which php || echo php) && $PHP_CMD artisan optimize && $PHP_CMD artisan migrate --force && $PHP_CMD artisan storage:link || true && $PHP_CMD -S 0.0.0.0:$PORT -t public
```

---

## Blueprintを使用する場合（推奨）

`render.yaml`の設定を確実に反映させるには：

1. 既存のサービスを削除（データベースは削除しない）
2. **New +** → **Blueprint**を選択
3. リポジトリを接続
4. `render.yaml`が自動的に読み込まれ、すべてのサービスが作成されます

---

## 各コマンドの説明

### Start Commandの各部分

1. `/usr/bin/php artisan optimize`
   - `config:cache`、`route:cache`、`view:cache`をまとめて実行
   - パフォーマンス向上のため必須

2. `/usr/bin/php artisan migrate --force`
   - データベースマイグレーション実行
   - `--force`は本番環境で必須

3. `/usr/bin/php artisan storage:link || true`
   - ストレージシンボリックリンク作成
   - S3使用時はエラーを無視（`|| true`）

4. `/usr/bin/php -S 0.0.0.0:$PORT -t public`
   - PHP組み込みサーバーでアプリケーション起動
   - `$PORT`はRenderが自動設定

---

## トラブルシューティング

### まだ`php: command not found`エラーが出る場合

1. **ログを確認**: Renderダッシュボードの**Logs**タブで、実際に実行されているコマンドを確認
2. **PHPのパスを確認**: ビルドログで`which php`の結果を確認
3. **環境変数を確認**: `PATH`環境変数が正しく設定されているか確認

### PHPのパスが異なる場合

Renderの環境によっては、PHPのパスが異なる可能性があります。以下のコマンドで確認：

```bash
# ビルドコマンドに追加して確認
which php
```

一般的なPHPのパス：
- `/usr/bin/php`
- `/usr/local/bin/php`
- `/opt/php/bin/php`


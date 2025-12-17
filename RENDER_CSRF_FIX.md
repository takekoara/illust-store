# RenderでCSRFトークン不一致（419エラー）の解決方法

## 問題

`CSRF token mismatch. Failed to load resource: the server responded with a status of 419`エラーが発生する。

## 原因

本番環境（HTTPS）でセッションクッキーの設定が正しくない場合に発生します。特に：
1. `SESSION_SECURE_COOKIE`が設定されていない
2. セッションドライバーが適切でない
3. セッションの有効期限が短すぎる

## 解決方法

### ステップ1: Renderダッシュボードで環境変数を設定

1. [Render Dashboard](https://dashboard.render.com/)にログイン
2. `illust-store`サービスをクリック
3. 左側メニューの「Environment」をクリック
4. 「Add Environment Variable」をクリック

### ステップ2: 以下の環境変数を追加

```
SESSION_DRIVER=database
SESSION_SECURE_COOKIE=true
SESSION_SAME_SITE=lax
SESSION_LIFETIME=120
```

**重要**: 
- `SESSION_SECURE_COOKIE=true`はHTTPS環境では**必須**です
- `SESSION_DRIVER=database`はRenderの一時ファイルシステムでは推奨されません
- `SESSION_SAME_SITE=lax`はデフォルトですが、明示的に設定することを推奨

### ステップ3: セッションテーブルの確認

データベースに`sessions`テーブルが存在することを確認：

```sql
-- PostgreSQLの場合
SELECT * FROM sessions LIMIT 1;
```

テーブルが存在しない場合は、マイグレーションを実行：

```bash
php artisan migrate
```

### ステップ4: 再デプロイ

環境変数を設定したら、サービスを再デプロイしてください。

### ステップ5: ブラウザのクッキーをクリア

1. ブラウザの開発者ツール（F12）を開く
2. 「Application」タブ → 「Cookies」を開く
3. サイトのクッキーを削除
4. ページをリロード

## 確認方法

### ブラウザのコンソールで確認

1. ブラウザの開発者ツール（F12）を開く
2. 「Application」タブ → 「Cookies」を開く
3. セッションクッキーを確認：
   - `Secure`フラグが設定されているか
   - `SameSite`が`Lax`になっているか
   - ドメインが正しいか

### ネットワークタブで確認

1. ブラウザの開発者ツール（F12）を開く
2. 「Network」タブを開く
3. リクエストをクリック
4. 「Headers」タブで以下を確認：
   - `Cookie`ヘッダーにセッションクッキーが含まれているか
   - `X-CSRF-TOKEN`ヘッダーが送信されているか

## よくある問題

### 問題1: セッションテーブルが存在しない

**解決方法**: マイグレーションを実行：
```bash
php artisan migrate
```

### 問題2: セッションクッキーが送信されない

**解決方法**: 
- `SESSION_SECURE_COOKIE=true`が設定されているか確認
- ブラウザのクッキーをクリア
- ページをリロード

### 問題3: CSRFトークンが一致しない

**解決方法**: 
- セッションが正しく保存されているか確認（データベースの`sessions`テーブル）
- `APP_KEY`が正しく設定されているか確認
- ブラウザのクッキーをクリアして再ログイン

## 推奨設定

Renderの環境変数に以下を設定することを推奨：

```
SESSION_DRIVER=database
SESSION_SECURE_COOKIE=true
SESSION_SAME_SITE=lax
SESSION_LIFETIME=120
SESSION_HTTP_ONLY=true
```

これにより、HTTPS環境でセッションが正しく動作します。


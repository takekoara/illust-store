# Render Mixed Content エラー解決ガイド

## エラーの説明

**Mixed Contentエラー**は、HTTPSで読み込まれたページがHTTPのリソース（CSS、JS、画像など）を読み込もうとしたときに発生します。

### エラーメッセージの例

```
Mixed Content: The page at 'https://illust-store.onrender.com/' was loaded over HTTPS, 
but requested an insecure script 'http://illust-store.onrender.com/build/assets/app-xxx.js'. 
This request has been blocked; the content must be served over HTTPS.
```

## 原因

1. **`APP_URL`がHTTPになっている**
   - `APP_URL=http://illust-store.onrender.com` → ❌
   - `APP_URL=https://illust-store.onrender.com` → ✅

2. **アセットURLが正しく生成されていない**
   - Laravel Viteプラグインが`APP_URL`を使用してアセットURLを生成
   - `APP_URL`がHTTPの場合、アセットもHTTPで生成される

## 解決方法

### ステップ1: APP_URLをHTTPSに設定

Renderダッシュボードの環境変数で：

```env
APP_URL=https://illust-store.onrender.com
```

**重要**: `http://`ではなく`https://`を使用してください。

### ステップ2: ASSET_URLを設定（オプション）

アセットURLを明示的に設定する場合：

```env
ASSET_URL=https://illust-store.onrender.com
```

### ステップ3: キャッシュをクリア

環境変数を変更したら、キャッシュをクリア：

```bash
php artisan config:clear
php artisan cache:clear
php artisan view:clear
```

Dockerfileの起動コマンドには`php artisan optimize`が含まれているため、再デプロイ時に自動的にキャッシュがクリアされます。

### ステップ4: 再デプロイ

環境変数を設定したら、サービスを再デプロイしてください。

## 確認方法

### ブラウザの開発者ツールで確認

1. **Network**タブを開く
2. ページをリロード
3. CSS/JSファイルのURLを確認
   - ✅ `https://illust-store.onrender.com/build/assets/...`
   - ❌ `http://illust-store.onrender.com/build/assets/...`

### HTMLソースで確認

ページのHTMLソースを確認し、アセットのURLがHTTPSになっているか確認：

```html
<!-- 正しい例 -->
<link rel="stylesheet" href="https://illust-store.onrender.com/build/assets/app-xxx.css">

<!-- 間違った例 -->
<link rel="stylesheet" href="http://illust-store.onrender.com/build/assets/app-xxx.css">
```

## よくある質問

### Q: APP_URLを変更してもエラーが続く

**A**: 以下を確認してください：
1. 環境変数が正しく保存されているか
2. サービスを再デプロイしたか
3. ブラウザのキャッシュをクリアしたか

### Q: 一部のアセットだけがHTTPになっている

**A**: ビルド時に`APP_URL`がHTTPだった可能性があります。`APP_URL`をHTTPSに設定して再ビルドしてください。

### Q: 開発環境でもHTTPSを使いたい

**A**: ローカルの`.env`でも`APP_URL=https://localhost`に設定できますが、通常は開発環境ではHTTPで問題ありません。

## まとめ

- **原因**: `APP_URL`がHTTPになっている
- **解決**: `APP_URL=https://illust-store.onrender.com`に設定
- **確認**: ブラウザの開発者ツールでアセットURLがHTTPSになっているか確認


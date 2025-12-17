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

### ステップ1: APP_URLをHTTPSに設定（最重要・必須）

Renderダッシュボードの環境変数で：

```env
APP_URL=https://illust-store.onrender.com
```

**重要**: 
- `http://`ではなく`https://`を使用してください
- **末尾の`/`は不要です**（`https://illust-store.onrender.com/`ではなく`https://illust-store.onrender.com`）
- これが最も重要な設定です
- `APP_URL`がHTTPの場合、アセットもHTTPで生成されます
- **これだけでMixed Contentエラーは解決します**

### ステップ2: vite.config.jsは変更不要

**重要**: `vite.config.js`は変更しないでください。シンプルな状態のままにしてください：

```javascript
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.tsx',
            refresh: true,
        }),
        react(),
    ],
});
```

`server`や`build`設定を追加すると、500エラーが発生する可能性があります。

### ステップ3: 設定キャッシュをクリア（重要）

`php artisan optimize`が設定キャッシュを作成するため、`APP_URL`の変更が反映されない場合があります。

**解決方法**: Start Commandに`config:clear`を追加します：

```bash
php artisan config:clear && php artisan optimize && ...
```

**注意**: `render.yaml`と`Dockerfile`のStart Commandを確認してください。既に修正済みの場合は、再デプロイするだけで反映されます。

### ステップ4: 再デプロイ

環境変数を設定し、設定キャッシュをクリアするコマンドを追加したら、サービスを再デプロイしてください。

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


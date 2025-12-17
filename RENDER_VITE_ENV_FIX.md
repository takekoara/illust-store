# RenderでVITE環境変数が読み込まれない問題の解決方法

## 問題

`VITE_STRIPE_KEY`などの`VITE_`で始まる環境変数がビルド時に読み込まれない。

## 原因

Renderでは、環境変数はビルド時にも利用可能ですが、以下の点を確認する必要があります：

1. **環境変数がRenderダッシュボードで設定されているか**
2. **環境変数の名前が正確か**（`VITE_STRIPE_KEY`）
3. **再デプロイ（再ビルド）が実行されているか**

## 解決方法

### ステップ1: Renderダッシュボードで環境変数を確認

1. [Render Dashboard](https://dashboard.render.com/)にログイン
2. `illust-store`サービスをクリック
3. 左側メニューの「Environment」をクリック
4. 以下の環境変数が設定されているか確認：
   - `VITE_STRIPE_KEY`（必須）
   - `VITE_REVERB_APP_KEY`（オプション）
   - `VITE_REVERB_HOST`（オプション）
   - `VITE_REVERB_PORT`（オプション）
   - `VITE_REVERB_SCHEME`（オプション）

### ステップ2: 環境変数の値を確認

- 変数名: `VITE_STRIPE_KEY`（正確に）
- 値: `pk_test_...`で始まる公開可能キー
- 前後にスペースがないか確認

### ステップ3: ビルドキャッシュをクリア

1. Renderダッシュボード → サービス → 「Settings」
2. 「Clear build cache」をクリック
3. 再デプロイ

### ステップ4: 再デプロイ

1. Renderダッシュボード → サービス
2. 「Manual Deploy」→「Deploy latest commit」をクリック
3. ビルドが完了するまで待つ（5-10分）

### ステップ5: ビルドログで確認

再デプロイ中に「Logs」タブで以下を確認：

- `npm run build`が実行されているか
- ビルドエラーが出ていないか
- 環境変数が読み込まれているか

## 確認方法

### ブラウザのコンソールで確認

1. ブラウザの開発者ツール（F12）を開く
2. 「Console」タブを開く
3. 以下を実行：

```javascript
console.log('VITE_STRIPE_KEY:', import.meta.env.VITE_STRIPE_KEY);
console.log('All VITE env vars:', Object.keys(import.meta.env).filter(k => k.startsWith('VITE_')));
```

`VITE_STRIPE_KEY`が`undefined`の場合は、環境変数がビルド時に埋め込まれていません。

## よくある問題

### 問題1: 環境変数を設定したが再デプロイしていない

**解決方法**: 環境変数を設定したら、必ず再デプロイ（再ビルド）が必要です。

### 問題2: 環境変数の値にスペースが含まれている

**解決方法**: 値の前後のスペースを削除してください。

### 問題3: 変数名が間違っている

**解決方法**: `VITE_STRIPE_KEY`（`VITE_`で始まる）であることを確認してください。

### 問題4: ビルドキャッシュの問題

**解決方法**: 「Clear build cache」を実行してから再デプロイしてください。

## 推奨手順

1. Renderダッシュボードで環境変数を確認
2. 値にスペースがないか確認
3. 「Clear build cache」を実行（オプション）
4. 「Manual Deploy」→「Deploy latest commit」で再デプロイ
5. ビルド完了後、ブラウザでページをリロード（Ctrl+Shift+R）
6. ブラウザのコンソールで環境変数を確認


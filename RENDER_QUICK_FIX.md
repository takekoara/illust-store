# Render 500エラー クイック修正ガイド

## 500エラーの主な原因（優先順位順）

### 1. APP_KEYが設定されていない（最も可能性が高い）

**確認方法**: Renderダッシュボードの環境変数で`APP_KEY`が設定されているか確認

**解決方法**:
```env
APP_KEY=base64:U4dKrCUzrStXAmwkTrmKB29m+L8fPDbG91pOuaQ3kqE=
```

### 2. データベース接続エラー

**確認方法**: ログでデータベース接続エラーが出ていないか確認

**解決方法**:
- `DB_CONNECTION=pgsql`が設定されているか
- データベースの接続情報が正しいか
- データベースが起動しているか

### 3. APP_URLがHTTPになっている

**確認方法**: 環境変数で`APP_URL`を確認

**解決方法**:
```env
APP_URL=https://illust-store.onrender.com
```

**重要**: `http://`ではなく`https://`を使用

## 環境変数の確認リスト

Renderダッシュボードで以下が設定されているか確認：

```env
# 必須
APP_ENV=production
APP_DEBUG=false
APP_KEY=base64:...（必須！）
APP_URL=https://illust-store.onrender.com

# データベース（DATABASE_URLまたは個別のDB_*変数）
DATABASE_URL=postgresql://...
# または
DB_CONNECTION=pgsql
DB_HOST=...
DB_PORT=5432
DB_DATABASE=...
DB_USERNAME=...
DB_PASSWORD=...
```

## vite.config.jsについて

`vite.config.js`の`manifest: true`は問題ありません。デフォルトで`true`なので、書かなくても同じですが、明示的に書いても問題ありません。

500エラーの原因は`vite.config.js`ではなく、環境変数の設定不足の可能性が高いです。

## トラブルシューティング手順

1. **ログを確認**: Renderダッシュボードの**Logs**タブで具体的なエラーメッセージを確認
2. **APP_KEYを確認**: 環境変数に`APP_KEY`が設定されているか確認
3. **データベース接続を確認**: データベースの接続情報が正しいか確認
4. **再デプロイ**: 環境変数を設定したら再デプロイ


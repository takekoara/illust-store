# ストレージ設定ガイド

## 現在のストレージ設定

### 本番環境（Render）
- **デフォルトディスク**: `s3`（AWS S3）
- **設定場所**: `render.yaml`の`FILESYSTEM_DISK=s3`

### 開発環境
- **デフォルトディスク**: `local`（`storage/app/private`）
- **公開ディスク**: `public`（`storage/app/public` → `public/storage`にシンボリックリンク）

## フリーイラストの配置方法

### 方法1: 静的ファイルとして配置（推奨）

**用途**: デモ用のフリーイラスト、固定の画像ファイル

**配置場所**: `public/images/free-illustrations/`

**メリット**:
- Gitにコミットできる
- デプロイ時に自動的に配置される
- 追加の設定不要
- CDN経由で高速に配信される

**手順**:
1. `public/images/free-illustrations/`ディレクトリを作成
2. フリーイラストを配置
3. Gitにコミット
4. デプロイ時に自動的に配置される

**使用例**:
```html
<img src="/images/free-illustrations/sample1.jpg" alt="サンプル画像" />
```

### 方法2: ストレージディスクを使用

**用途**: ユーザーがアップロードした画像、動的に追加される画像

**現在の実装**: `ImageService`は`Storage::disk('public')`を使用

**本番環境での動作**:
- `FILESYSTEM_DISK=s3`が設定されている場合、S3に保存される
- `FILESYSTEM_DISK=public`の場合、`storage/app/public`に保存される

**注意**: Renderの`storage/app/public`は永続化されないため、本番環境ではS3を使用することを推奨

## フリーイラストの推奨配置方法

### ステップ1: ディレクトリを作成

```bash
mkdir -p public/images/free-illustrations
```

### ステップ2: 画像を配置

フリーイラストを`public/images/free-illustrations/`に配置

例:
```
public/images/free-illustrations/
  ├── sample1.jpg
  ├── sample2.png
  └── sample3.jpg
```

### ステップ3: Gitにコミット

```bash
git add public/images/free-illustrations/
git commit -m "Add free illustration images"
git push origin master
```

### ステップ4: 使用例

**Bladeテンプレート**:
```blade
<img src="{{ asset('images/free-illustrations/sample1.jpg') }}" alt="サンプル画像" />
```

**React/TypeScript**:
```tsx
<img src="/images/free-illustrations/sample1.jpg" alt="サンプル画像" />
```

## ストレージ設定の変更方法

### 本番環境でS3を使用しない場合

`render.yaml`の`FILESYSTEM_DISK`を変更：

```yaml
envVars:
  - key: FILESYSTEM_DISK
    value: public  # S3の代わりにpublicディスクを使用
```

**注意**: Renderの`storage/app/public`は永続化されないため、再デプロイ時に削除される可能性があります。本番環境ではS3の使用を推奨します。

### S3の設定

Renderダッシュボードで以下の環境変数を設定：

```env
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=your-bucket-name
AWS_URL=https://your-bucket.s3.amazonaws.com
```

## まとめ

- **フリーイラスト**: `public/images/free-illustrations/`に配置（静的ファイル）
- **ユーザーアップロード画像**: ストレージディスクを使用（本番環境ではS3推奨）
- **デプロイ時**: `public`ディレクトリの内容は自動的に配置される


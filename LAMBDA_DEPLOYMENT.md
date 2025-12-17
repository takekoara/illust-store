# 🚀 AWS Lambda (Serverless) デプロイガイド

## 概要

このガイドでは、Illust StoreアプリケーションをAWS Lambdaにデプロイする可能性と課題について説明します。

## ⚠️ 重要な注意事項

### Lambdaでのデプロイは**推奨されません**

現在のアプリケーション構成では、Lambdaでのデプロイには**多くの課題**があります。

## 🚫 Lambdaでのデプロイの課題

### 1. Reverb（リアルタイムチャット）が動作しない

**問題**: ReverbはWebSocket接続を維持する必要がありますが、Lambdaはステートレスで、長時間接続を維持できません。

**解決策**: 
- Reverbを別のサービス（EC2、ECS、または専用のWebSocketサービス）で実行
- または、Pusherなどのマネージドサービスを使用

### 2. コールドスタートの問題

**問題**: Lambdaは初回リクエスト時にコールドスタートが発生し、数秒かかることがあります。

**影響**: 
- ユーザー体験の低下
- タイムアウトのリスク

### 3. 実行時間の制限

**問題**: Lambdaの最大実行時間は15分です。

**影響**: 
- 長時間かかる処理（画像処理、大量データのインポートなど）ができない
- タイムアウトのリスク

### 4. パッケージサイズの制限

**問題**: Lambdaのデプロイパッケージサイズは250MB（圧縮後50MB）に制限されています。

**影響**: 
- Laravel + 依存関係 + アセットでサイズが大きくなる可能性
- 最適化が必要

### 5. キュー処理の複雑さ

**問題**: 現在のアプリケーションは`database`キューを使用していますが、LambdaではSQS推奨です。

**解決策**: 
- SQSに変更
- または、別のLambda関数でキューを処理

### 6. セッション管理

**問題**: Lambdaはステートレスなので、セッションを外部ストレージ（DynamoDB、Redis）に保存する必要があります。

### 7. ファイルアップロード

**問題**: Lambdaの一時ストレージは512MBに制限されています。

**解決策**: 
- S3に直接アップロード
- または、API Gateway + Lambdaで処理

## ✅ Lambdaでデプロイ可能な場合

以下の条件を満たす場合、Lambdaでのデプロイを検討できます：

1. **シンプルなAPI**: RESTful APIのみ
2. **ステートレス**: セッション不要
3. **短時間処理**: 数秒以内で完了する処理
4. **リアルタイム機能不要**: WebSocket不要
5. **軽量な依存関係**: パッケージサイズが小さい

## 🔧 Lambdaでデプロイする場合の手順（参考）

### 必要なパッケージ

```bash
composer require bref/bref bref/laravel-bridge
```

### serverless.ymlの設定例

```yaml
service: illust-store

provider:
  name: aws
  runtime: provided.al2
  region: ap-northeast-1
  environment:
    APP_ENV: production
    APP_DEBUG: false
    LOG_CHANNEL: stderr

functions:
  web:
    handler: public/index.php
    timeout: 30
    memorySize: 1024
    events:
      - httpApi: '*'

plugins:
  - ./vendor/bref/bref

layers:
  - ${bref:layer.php-82}
```

### 必要な変更

1. **ストレージをS3に変更**（必須）
   ```env
   FILESYSTEM_DISK=s3
   ```

2. **セッションをDynamoDBに変更**
   ```env
   SESSION_DRIVER=dynamodb
   ```

3. **キューをSQSに変更**
   ```env
   QUEUE_CONNECTION=sqs
   ```

4. **Reverbを削除または別サービスに移行**

5. **アセットをS3またはCloudFrontに配置**

## 💰 コスト比較

### Lambda（サーバーレス）
- **リクエストベース**: リクエスト数に応じて課金
- **実行時間**: 実行時間に応じて課金
- **メモリ**: メモリサイズに応じて課金
- **無料枠**: 100万リクエスト/月

### EC2/ECS（従来型）
- **固定コスト**: インスタンスの稼働時間に応じて課金
- **予測可能**: 月額固定料金

### 推奨
- **小規模・低トラフィック**: Lambdaが有利
- **中規模以上・リアルタイム機能**: EC2/ECSが有利

## 🎯 推奨される代替案

### 1. AWS ECS（Elastic Container Service）

**メリット**:
- Dockerコンテナとしてデプロイ
- スケーラブル
- Reverbが動作可能
- キュー処理が簡単

**デメリット**:
- 常時起動のコスト
- 設定が複雑

### 2. AWS EC2

**メリット**:
- シンプル
- 完全な制御
- Reverbが動作可能

**デメリット**:
- サーバー管理が必要
- スケーリングが手動

### 3. AWS App Runner

**メリット**:
- 自動スケーリング
- 簡単なデプロイ
- コンテナベース

**デメリット**:
- Reverbの設定が複雑

### 4. Render / Heroku / Railway

**メリット**:
- 簡単なデプロイ
- 管理不要
- ドキュメントが充実

**デメリット**:
- ベンダーロックイン
- コストが高い可能性

## 📊 比較表

| 項目 | Lambda | ECS | EC2 | Render |
|------|--------|-----|-----|--------|
| **デプロイの簡単さ** | ⭐⭐⭐ | ⭐⭐ | ⭐ | ⭐⭐⭐ |
| **コスト（低トラフィック）** | ⭐⭐⭐ | ⭐⭐ | ⭐⭐ | ⭐ |
| **コスト（高トラフィック）** | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ |
| **スケーラビリティ** | ⭐⭐⭐ | ⭐⭐⭐ | ⭐ | ⭐⭐⭐ |
| **Reverb対応** | ❌ | ✅ | ✅ | ✅ |
| **キュー処理** | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| **管理の手間** | ⭐⭐⭐ | ⭐⭐ | ⭐ | ⭐⭐⭐ |

## 🎯 結論と推奨

### このアプリケーションの場合

**Lambdaは推奨されません**。理由：

1. ✅ Reverb（リアルタイムチャット）が動作しない
2. ✅ キュー処理が複雑
3. ✅ コールドスタートの問題
4. ✅ パッケージサイズの制限

### 推奨されるデプロイ先

1. **Render**（最も簡単）
   - ドキュメント: `RENDER_DEPLOYMENT.md`を参照
   - 注意: S3ストレージが必要

2. **AWS ECS**（スケーラブル）
   - Dockerコンテナとしてデプロイ
   - すべての機能が動作

3. **AWS EC2**（シンプル）
   - 従来型のサーバー
   - 完全な制御

## 📚 参考リンク

- [Bref公式ドキュメント](https://bref.sh/)
- [Laravel on Lambda](https://bref.sh/docs/frameworks/laravel.html)
- [AWS Lambda制限](https://docs.aws.amazon.com/lambda/latest/dg/gettingstarted-limits.html)


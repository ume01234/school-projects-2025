# 展示用デプロイガイド

## 前提条件

- Docker Desktop がインストールされていること

## 使用方法

### 1. コンテナのビルドと起動

```bash
# プロジェクトルートディレクトリで実行
docker-compose up -d
```

### 2. アクセス

ブラウザで `http://localhost:8080` にアクセス

### 3. 停止

```bash
docker-compose down
```

### 4. 再ビルド（コード変更後）

```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## 別のポートを使用する場合

`docker-compose.yml` の `ports` セクションを編集：

```yaml
ports:
  - "3000:80"  # 例: ポート3000でアクセス
```

## トラブルシューティング

### ポートが既に使用されている場合

エラー: `Bind for 0.0.0.0:8080 failed: port is already allocated`

解決策: `docker-compose.yml` でポート番号を変更するか、使用中のプロセスを停止する

### コンテナのログを確認

```bash
docker-compose logs -f
```

### コンテナの状態を確認

```bash
docker-compose ps
```

## 展示環境での注意事項

- 展示用PCにDocker Desktopをインストールしておく
- ファイアウォールで指定ポートが開いていることを確認する
- カメラアクセス許可が必要なため、ブラウザの権限設定を確認する


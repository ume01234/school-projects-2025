# ゴミ分別支援アプリ
> [View English version](./README.en.md)

## ✔︎ 概要

つくば市の各地域に対応したゴミ出しスケジュールを表示するとともに、AI(Gemini)とのチャットを通じて分別が難しいゴミの処理方法を相談することができるアプリ

---

## ✔︎ 主な機能

- 地域ごとのゴミ出しカレンダーの表示(春日、研究学園などつくば市全域に対応)
- Gemini APIを活用した、対話形式でのゴミ分別相談チャット  
- Flask ベースの軽量Webアプリとして実装  
- .envにAPIキーや地域名の設定をセキュアに保持

---

## ✔︎ 技術構成

- **言語**
  - Python (Flaskアプリ開発)
  - MySQL (ゴミ出しカレンダーデータの保存)
  - HTML/CSS (UI構築)
- **主要ライブラリ**：
  - `Flask`（Webアプリケーションフレームワーク）
  - `flask-session`（セッション管理のためのFlask拡張）
  - `mysql-connector-python`（MySQLとの接続）
  - `python-dotenv`（.envからの設定読み込み）
  - `openai` / `google.generativeai`（対話AI連携）

---

## ✔︎ フォルダ構成

```bash
garbage_app/
├── app/                # Flaskルーティング/AI連携ロジック
│   ├── __init__.py     # Flaskアプリの初期化
│   ├── routes.py       # ルーティング
│   ├── gpt_utils.py    # Gemini/GPTとの対話ロジック
│   ├── gomi_utils.py   # ゴミ出し日判定ロジック(隔週・曜日等)
│   └── templates/      # HTMLテンプレート(Jinja2)
├── db/                 # MySQL関連スクリプト(テーブル作成・初期データ等)
├── static/             # CSS静的ファイル
├── config.py           # DB接続やAPIキーの読み込み設定
├── run.py              # Flaskアプリのエントリーポイント
├── .env                # 環境変数(非公開)
├── README.md
├── README.en.md
└── requirements.txt
```



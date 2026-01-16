# オセロ実験プラットフォーム

接待AIと目隠しオセロを用いた人間-AIインタラクション研究のためのWebプラットフォーム

## プロジェクト概要

このプロジェクトは、オセロ（リバーシ）を題材に、人間とAIの対戦を通じて以下の研究を行うプラットフォームです：

1. **接待AI研究**: 勝利ではなく「接戦」を目指すAIが、人間のパフォーマンスと体験にどう影響するか
2. **HCI・認知研究**: 盤面情報を制限した「目隠しオセロ」による認知負荷とUXの変化

## 現在の実装状況

### ✅ 完成済み

- **通常オセロモード**
  - 完全な盤面情報あり
  - ランダムAIとの対戦
  - ゲームログ・アンケート保存（Firebase Firestore）

- **UIコンポーネント**
  - モード選択画面
  - ゲーム画面（盤面、スコア表示、ターン表示）
  - 結果表示画面
  - アンケートフォーム（5項目のリッカート尺度 + 自由記述）

- **レスポンシブデザイン**
  - モバイル・デスクトップ対応

### 🚧 今後の実装予定

1. **目隠しオセロモード（軽度・中程度・重度）**
   - 盤面の一部を非表示にしたモード
   - 確認アクション（手番を消費して一時的に可視化）

2. **強化学習AI**
   - 勝利最大化AI（ガチAI）
   - 接待AI（接戦最大化）

3. **データ分析機能**
   - 対局ログの可視化
   - アンケート結果の集計

## 研究背景

### 接待AI（Close-Game AI）

従来のゲームAIは「勝利最大化」を目標としますが、本研究では「人間との接戦」を目標とする新しいAI設計を提案します。

**期待される効果**:
- 楽しさ・モチベーションの向上
- 上達意欲の促進
- 自己効力感の変化

**研究の新規性**:
- 零和ボードゲームにおける接戦志向AI
- Dynamic Difficulty Adjustment (DDA)の新しいアプローチ
- 人間のパフォーマンス・心理・上達への影響を総合評価

### 目隠しオセロ

完全情報ゲームに意図的な部分観測を導入し、以下を調査：
- 情報量と認知負荷の関係
- ミス率・思考時間の変化
- 主観的負荷（疲労感・難しさ）
- 楽しさ・没入感への影響

## 技術スタック

- **フロントエンド**: React + TypeScript + Vite
- **バックエンド**: Firebase (Firestore)
- **デプロイ**: Vercel

## セットアップ

### 1. 依存関係のインストール

```bash
cd ml-rl-game-ai-report
npm install
```

### 2. Firebase設定

1. [Firebase Console](https://console.firebase.google.com/)でプロジェクトを作成
2. Firestoreデータベースを有効化
3. プロジェクト設定からWebアプリの認証情報を取得
4. `.env.local`ファイルを作成:

```bash
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 3. 開発サーバー起動

```bash
npm run dev
```

### 4. ビルド

```bash
npm run build
```

## デプロイ

Vercelへのデプロイ手順：

1. GitHubにプッシュ
2. [Vercel](https://vercel.com/)でリポジトリをインポート
3. プロジェクトルートを `ml-rl-game-ai-report` に設定
4. 環境変数（Firebase設定）を追加
5. デプロイ

## データ構造

### ゲームログ (`gameLogs`)

```typescript
{
  gameId: string;
  mode: 'normal' | 'blindfold1' | ...;
  startTime: Timestamp;
  endTime: Timestamp;
  moves: Array<{
    player: 'black' | 'white';
    position: { row: number, col: number };
    timestamp: Timestamp;
    capturedCount: number;
  }>;
  finalScore: { black: number; white: number };
  winner: 'black' | 'white' | 'draw';
}
```

### アンケート (`questionnaires`)

```typescript
{
  gameId: string;
  nickname?: string;
  difficulty: number;    // 1-5
  enjoyment: number;     // 1-5
  tension: number;       // 1-5
  frustration: number;   // 1-5
  playAgain: number;     // 1-5
  comments?: string;
  submittedAt: Timestamp;
}
```

## 今後の研究計画

### Phase 1: 基盤実装（完了）
- ✅ 通常オセロモード
- ✅ データ収集機能

### Phase 2: 実験モード追加
- 🚧 目隠しオセロ（3段階）
- 🚧 ガチAI実装

### Phase 3: 接待AI開発
- 🚧 報酬関数設計（接戦最大化）
- 🚧 強化学習による学習
- 🚧 人間実験・比較評価

### Phase 4: データ分析・論文化
- 🚧 統計分析
- 🚧 結果の可視化
- 🚧 論文執筆

## ライセンス

MIT

## 貢献

バグ報告や機能提案は Issue でお願いします。

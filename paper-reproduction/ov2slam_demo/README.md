# OV²SLAM: A Fully Online and Versatile Visual SLAM for Real-Time Applications
> [View English version](./README.en.md)
ビジュアルSLAMフレームワークについての論文を参考にした追実装。


## ✔︎ 論文情報

- **タイトル**: OV²SLAM: A Fully Online and Versatile Visual SLAM for Real-Time Applications  
- **著者**: Axel Barrau, Pierre Gouton, Jean-Philippe Tardif, et al.  
- **公開年**: 2021年  
- **リンク**: [arXiv:2102.04060](https://arxiv.org/abs/2102.04060) 

これは、リアルタイムに自己位置推定とマッピングを同時に行う軽量なビジュアルSLAMフレームワーク「OV²SLAM」についての論文。  
単眼・ステレオ・RGB-Dカメラのいずれにも対応し、ROSベースの柔軟な設計が特徴。

---

## ✔︎ 技術構成

OV²SLAMの構成は、従来のビジュアルSLAMを簡素化しつつも、オンライン性と高精度を両立している。主な構成要素：

### 1. Front-End（特徴点抽出と追跡）
- ORB特徴量（またはFAST + BRIEF）を用いて画像から特徴点を抽出
- Lucas–Kanade光学フローにより追跡
- Keyframe（代表フレーム）を選択し、次の処理へ送信

### 2. Local Mapping（局所マッピング）
- キーフレーム間のマッチングから三角測量を行い、3D点群を構築
- 局所バンドル調整（Local Bundle Adjustment）により軌道と地図を最適化

### 3. Loop Closing（ループ閉じ検出）
- iBoW-LCD（画像BoW辞書）によるループ検出
- Pose Graph Optimizationによってループ誤差を補正し、全体マップを一貫化

### 4. 軌道推定と地図出力
- スレッド非依存な軽量実装により、リアルタイムに軌道を更新
- 出力：カメラの6DoF軌道＋スパースな3D地図

### 5. 入力・出力形式
- 入力：RGB映像（単眼／ステレオ／RGB-D対応）
- 出力：リアルタイム軌道、可視化マップ、位置姿勢ファイル（TUM/EuRoC形式）

---

## ✔︎ 実行コマンド
```bash
python3 -m venv .venv
source .venv/bin/activate
pip install opencv-python numpy
pip install -r requirements.txt   
python main.py

```

---

## ✔︎ 参考

- 論文: [arXiv 2102.04060](https://arxiv.org/abs/2102.04060)
- iBoW-LCD: Loop Closure Detection via Incremental Bag-of-Words


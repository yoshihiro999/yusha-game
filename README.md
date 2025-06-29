# 魔王ダンジョン・プロトタイプ

このリポジトリは、2Dダンジョン・マネジメント型ゲームの試作コードをまとめたものです。勇者の侵攻を魔物の生態系で迎え撃つ構造を軸に設計されています。

ゲームはターン制のwave形式で進行し、モンスターの捕食・進化による魔素循環を重視したデザインになっています。各種JSONデータとスクリプトの連携で構成を管理しています。

## ディレクトリ構成

```
├── data/                     # ゲーム用各種データ
│   ├── game_config.json         ← ゲーム全体設定
│   ├── hero_parties.json        ← 勇者パーティ編成
│   ├── heroes.json              ← 職業定義・セリフ構成
│   ├── map.json                 ← 地形・資源構成
│   ├── layered_map.json         ← レイヤー付きマップサンプル
│   ├── monsters.json            ← 魔物ID・種族構成
│   └── monsters_detailed.json   ← 魔物詳細パラメータ
│
├── lib/                      # 補助処理
│   ├── resourceManager.js       ← 資源循環ロジック
│   └── utils.js                 ← 共通ユーティリティ
│
├── scenes/                   # 画面HTML
│   ├── game.html                ← メインUI
│   ├── hero_invade.html         ← 勇者侵攻モードUI
│   ├── monster_canvas.html      ← 魔物配置モードUI
│   ├── layered_map.html         ← レイヤー構造マップ表示
│   ├── hero_book.html          ← 勇者図鑑画面
│   ├── monster_book.html       ← モンスター図鑑画面
│   ├── title.html              ← タイトル画面
│   └── index.html               ← ランチャー画面
│
├── scripts/                 # ゲーム制御スクリプト
│   ├── game.js                  ← ゲーム状態管理
│   ├── turn_manager.js          ← フェーズ・wave制御
│   ├── hero_ai.js               ← 勇者探索AI
│   ├── monster_ai.js            ← モンスターAI
│   ├── map_renderer.js          ← マップ描画
│   ├── layered_map_renderer.js  ← レイヤーマップ描画
│   ├── monster_canvas.js        ← 魔物配置処理
│   ├── save_manager.js          ← ローカル保存操作
│   ├── speechLayer.js           ← セリフ表示レイヤー
│   ├── title.js                 ← タイトル画面制御
│   ├── hero_book.js             ← 勇者図鑑画面
│   ├── monster_book.js          ← モンスター図鑑画面
│   ├── generate_banter.js       ← 会話データ生成（Node）
│   └── generate_skill_lines.js  ← スキル台詞生成（Node）
│
├── assets/                # 画像アセット
│   ├── backgrounds/          ← 背景画像用
│   ├── characters/           ← キャラクター画像用
│   ├── monsters/             ← モンスター画像用
│   └── ui/                   ← UI素材用
│
├── styles/                 # 共通スタイル
│   └── styles.css               ← 画面用スタイル
│
├── docs/                  # 仕様書・進捗記録
│   ├── feature_map.md        ← 機能と担当ファイル一覧
│   ├── progress.md           ← 開発進捗とToDo
│   ├── json_spec.md          ← JSON構造仕様
│   ├── evolution.md          ← モンスター進化仕様
│   └── resource_cycle.md     ← 魔素循環仕様
```
## ドキュメント

設計資料や進捗状況は `docs/` 以下にまとめています。主なファイルは次の通りです。

- `docs/feature_map.md` : 機能と担当ファイルの対応表
- `docs/progress.md` : 実装状況や ToDo
- `docs/json_spec.md` : 各 JSON データのフォーマット
- `docs/evolution.md` : モンスター進化システム
- `docs/resource_cycle.md` : 魔素循環や死骸処理の仕様
- `docs/ai_design.md` : 魔物と勇者のAI概要

## ファイル連携例

- `scenes/game.html` から `game.js` を読み込み、内部で `TurnManager` や `HeroAI`、`monsterAI` を利用します。
- `hero_invade.html` は `HeroAI` と `MapRenderer` を組み合わせたテストシーンです。
- `monster_canvas.js` は `lib/resourceManager.js` と `scripts/map_renderer.js` を呼び出し、マップ上で資源吸収を試します。
- 図鑑画面 (`hero_book.js`, `monster_book.js`) では JSON データを読み込んでリスト表示を行います。


## 基本仕様メモ

- **ターン制 / wave構造**
  - プレイヤーは準備フェーズで魔物を配置し、勇者はwave単位で侵攻します。
  - 各waveは「勇者チーム出発 → 撃退または勝利」で進行し、全waveをしのげばステージクリアとなります。
- **生態系ピラミッドとリソース循環**
  - 魔物は下位 → 中位 → 上位へ捕食・吸収し成長します。
  - 死骸や捕食により養分・魔分が還元され、マップ全体の魔力は原則保存されます。
- **初期コストと魔力増加**
  - wave開始前に配布される初期コストが主な魔力源です。
  - 勇者を倒すと持ち込み魔力がマップへ還元され、成長加速が可能になります。
- **勇者AIと探索ロジック**
  - 右手法ベースに記憶を持たせた探索を行います。
  - 勇者はパーティ単位で行動し、代表キャラが探索・戦闘を実行します。

## 実行方法

ブラウザで`scenes/title.html`を開くとタイトル画面が表示されます。セーブデータがあれば「つづきから」で再開できます。開発中のため、ローカルの簡易HTTPサーバなどで公開すると動作確認しやすくなります。

`scenes/index.html`では開発用ランチャーを利用できます。

`scenes/layered_map.html`を開くと、レイヤー構造を用いたマップ描画サンプルを確認できます。

## 今後の追加予定

- 各JSON構造の詳細な仕様ドキュメント
- 魔物ごとの進化アルゴリズム（詳しくは`docs/evolution.md`参照）
- 魔素循環と死骸処理（`docs/resource_cycle.md`参照）
- UI演出強化（セリフ、エフェクト、地形変化）
- 勇者イベントスクリプト・ボスパターン設計

## 進行状況まとめ

各フォルダの主なファイルと現在の進捗を整理しました。次のフェーズで着手すべき事項も
併記しています。

| ファイル/ディレクトリ | 状況 | 次のフェーズ |
|------------------------|------|---------------|
| `data/game_config.json` | 基本項目のみ設定済み | マップサイズ以外の拡張設定を追加 |
| `data/hero_parties.json` | 40チーム分のデータを作成済み | パラメータのバランス調整 |
| `data/heroes.json` | 基本ステータスのみ記載 | スキル・装備項目の追加 |
| `data/map.json` | ダミーの平坦マップ | 実際の地形データへ更新 |
| `data/layered_map.json` | 表示用サンプル完了 | ゲーム本編への取り込み |
| `data/monsters.json` | IDと進化情報を簡易登録 | 追加種族や進化分岐の拡充 |
| `data/monsters_detailed.json` | 詳細データを一部記載 | ゲームロジックとの連携 |
| `lib/resourceManager.js` | マップ生成・Wave管理のみ | 養分・魔分循環処理の実装 |
| `lib/utils.js` | 乱数や補助関数を提供 | ドキュメント整備 |
| `scripts/game.js` | 基本的なターン制は動作 | 処理の整理とテスト追加 |
| `scripts/hero_ai.js` | 右手法ベースで動作 | トラップ対応や記憶強化 |
| `scripts/monster_ai.js` | 種族別の挙動を実装 | 行動分岐やAI強化 |
| `scripts/monster_canvas.js` | 成長デモを確認可能 | バランス調整・UI改良 |
| `scenes/*.html` | 各画面の最低限表示のみ | 演出・デザインの作り込み |
| `assets/` | `.gitkeep`のみで実データ未登録 | 実際の画像アセットを準備 |

### 共通ユーティリティ
- `randomInt(min, max)` : 指定範囲の整数を返す
- `clamp(value, min, max)` : 値を範囲内に収める
- `randChoice(array)` : 配列から要素をランダム選択

### 未着手・中途半端な項目

- 資源循環システムの本格実装（`lib/resourceManager.js`の拡張が必要）
- 画像アセットの収集と配置（`assets/`以下）
- 各データファイルの詳細仕様書作成
- テストコードの整備



## コントリビュート方法

バグ報告や機能提案は Issues へお願いします。
プルリクエストは `main` ブランチを対象にしてください。


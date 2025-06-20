# CHANGELOG

Codex による更新内容を時系列で記録します。新しい変更は上に追加してください。

## 2025-06-22
- `lib/resourceManager.js` に座標指定で資源を吸収する `absorbResources()` を追加。
- `scripts/monster_canvas.js` と `scenes/monster_canvas.html` を改修し、
  クリックしたマスへ赤いブロックを配置して吸収結果をログ表示する簡易テストを実装。

## 2025-06-21
- `scripts/map_renderer.js` に `renderMap()` を実装。`layered_map.json` の複数レイヤーを描画可能にした。

## 2025-06-20
- `data/layered_map.json` の構造を整理し、`scripts/layered_map_renderer.js` で多層描画に対応。
- `lib/resourceManager.js` に資源分配・吸収処理を追加。
- 共通処理をまとめた `lib/utils.js` を拡充し、各スクリプトで利用。
- JSON スキーマ仕様 (`docs/json_spec.md`) とコントリビュートガイドを作成。
- README にコントリビュート方法を追記。

## 2025-06-19
- wave 制の勇者侵攻ロジックや自動戦闘システムを実装。
- 魔物 AI と進化設計、死骸循環の仕様を追加。
- タイトル画面・セーブ機能など UI 周りを整備。
- `data/hero_parties.json` などデータファイルを拡充し、会話スクリプトを追加。
- ドキュメント類 (`docs/progress.md` ほか) を整備。
- `docs/CHANGELOG.md` を新規作成。
- `docs/feature_map.md` を追加。
- `docs/tom_template.md` を追加し、Codex 依頼の記録テンプレートを整備。

## 2025-06-18
- プロジェクトの初期セットアップと基本的なゲームシーンを作成。

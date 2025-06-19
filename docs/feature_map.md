# 機能とファイル対応表

本ファイルでは、実装済み機能と関連する主要ファイルを対応付けて整理します。

| 機能 | 関連ファイル |
|------|--------------|
| ゲーム状態管理 | `scripts/game.js`, `scripts/turn_manager.js` |
| マップ描画 | `scripts/map_renderer.js`, `scripts/layered_map_renderer.js` |
| 勇者AI | `scripts/hero_ai.js` |
| モンスターAI | `scripts/monster_ai.js` |
| モンスター配置 | `scripts/monster_canvas.js` |
| リソース管理 | `lib/resourceManager.js` |
| 共通ユーティリティ | `lib/utils.js` |
| 勇者/モンスター図鑑 | `scripts/hero_book.js`, `scripts/monster_book.js` |
| データ読み込み | `data/*.json` |
| 画面UI | `scenes/*.html`, `styles/styles.css` |

追加機能を実装した際は、この表に関連ファイルを追記してください。

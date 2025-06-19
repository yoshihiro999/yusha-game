// 掘削処理：クリック or タップでマスを掘る

function generateInitialMap(width, height) {
  const tiles = [];
  for (let y = 0; y < height; y++) {
    const row = [];
    for (let x = 0; x < width; x++) {
      row.push({ dug: false, mana: Math.random(), nutrients: Math.random() });
    }
    tiles.push(row);
  }
  return { width, height, tiles };
}

// 初期マップ生成
const mapData = generateInitialMap(20, 20);
const tileSize = 20; // 1マスのピクセルサイズ（仮）

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = mapData.width * tileSize;
canvas.height = mapData.height * tileSize;

// マップ描画（未掘削はグレー、掘削済みは紫〜緑）
function renderMap() {
  for (let y = 0; y < mapData.height; y++) {
    for (let x = 0; x < mapData.width; x++) {
      const tile = mapData.tiles[y][x];
      if (!tile.dug) {
        ctx.fillStyle = '#444';
      } else {
        const mana = tile.mana;
        const nutrients = tile.nutrients;
        ctx.fillStyle = `rgb(${mana * 50}, ${nutrients * 60}, 100)`;
      }
      ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
    }
  }
}

// 掘削処理
canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = Math.floor((e.clientX - rect.left) / tileSize);
  const y = Math.floor((e.clientY - rect.top) / tileSize);
  const tile = mapData.tiles[y][x];
  if (!tile.dug) {
    tile.dug = true;
    renderMap();
  }
});

renderMap();

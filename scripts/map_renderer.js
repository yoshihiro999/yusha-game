export class MapRenderer {
  constructor(canvas, map) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.map = map;
    this.cellSize = 12;
    canvas.width = map.width * this.cellSize;
    canvas.height = map.height * this.cellSize;
  }

  render(heroes = []) {
    for (let y = 0; y < this.map.height; y++) {
      for (let x = 0; x < this.map.width; x++) {
        const tile = this.map.tiles[y][x];
        if (tile.type === 'path') {
          this.ctx.fillStyle = '#dcb35c';
        } else {
          const mana = tile.mana;
          const nutrients = tile.nutrients;
          this.ctx.fillStyle = `rgb(${mana * 30}, ${nutrients * 30}, 100)`;
        }
        this.ctx.fillRect(
          x * this.cellSize,
          y * this.cellSize,
          this.cellSize,
          this.cellSize
        );
      }
    }

    this.ctx.fillStyle = 'blue';
    heroes.forEach(h => {
      this.ctx.fillRect(
        h.x * this.cellSize,
        h.y * this.cellSize,
        this.cellSize,
        this.cellSize
      );
    });
  }
}

export function renderMap(canvas, mapData) {
  const ctx = canvas.getContext('2d');
  const tileSize = 20;
  canvas.width = mapData.size[0] * tileSize;
  canvas.height = mapData.size[1] * tileSize;

  const drawTile = (type, x, y) => {
    const colors = {
      sky: '#87ceeb',
      mountain: '#776655',
      building: '#5555aa',
      soil: '#aa8855',
      rock: '#888888',
      grass: '#77aa77',
      shine: '#ffffcc',
      fog: 'rgba(0,0,0,0.4)',
      path: '#dcb35c'
    };
    ctx.fillStyle = colors[type] || '#000000';
    ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
  };

  const drawTiles = (tile) => {
    if (tile.area) {
      const [[sx, sy], [ex, ey]] = tile.area;
      for (let y = sy; y <= ey; y++) {
        for (let x = sx; x <= ex; x++) {
          drawTile(tile.type, x, y);
        }
      }
    } else if (tile.line) {
      const [[sx, sy], [ex, ey]] = tile.line;
      const dx = Math.sign(ex - sx);
      const dy = Math.sign(ey - sy);
      const len = Math.max(Math.abs(ex - sx), Math.abs(ey - sy));
      for (let i = 0; i <= len; i++) {
        drawTile(tile.type, sx + dx * i, sy + dy * i);
      }
    } else if (tile.position) {
      const [x0, y0] = tile.position;
      const [w, h] = tile.size || [1, 1];
      for (let yy = 0; yy < h; yy++) {
        for (let xx = 0; xx < w; xx++) {
          drawTile(tile.type, x0 + xx, y0 + yy);
        }
      }
    }
  };

  const drawObject = (obj) => {
    const colors = {
      slime: '#00cc88',
      hero_corpse: '#884488',
      explosion: '#ff7733'
    };
    const [x, y] = obj.position;
    ctx.fillStyle = colors[obj.type] || '#000';
    ctx.fillRect(x * tileSize + 2, y * tileSize + 2, tileSize - 4, tileSize - 4);
  };

  const drawUI = (ui) => {
    if (ui.type === 'label') {
      ctx.fillStyle = 'black';
      ctx.font = 'bold 16px sans-serif';
      const [x, y] = ui.position;
      ctx.fillText(ui.content, x * tileSize, (y + 1) * tileSize);
    }
  };

  const order = [
    'background',
    'terrain_base',
    'terrain_decor',
    'object',
    'fx_effects',
    'ui_overlay',
    'dark_mask'
  ];

  for (const name of order) {
    const layer = mapData.layers.find((l) => l.name === name);
    if (!layer) continue;
    if (layer.tiles) layer.tiles.forEach(drawTiles);
    if (layer.objects) layer.objects.forEach(drawObject);
    if (layer.ui) layer.ui.forEach(drawUI);
  }
}



export class LayeredMapRenderer {
  constructor(canvas, mapData) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.mapData = mapData;
    this.cellSize = 16;
    canvas.width = mapData.size[0] * this.cellSize;
    canvas.height = mapData.size[1] * this.cellSize;
  }

  render() {
    for (const layer of this.mapData.layers) {
      if (layer.tiles) {
        for (const tile of layer.tiles) {
          this.#drawTiles(tile);
        }
      }
      if (layer.objects) {
        for (const obj of layer.objects) {
          this.#drawObject(obj);
        }
      }
    }

    if (this.mapData.ui) {
      this.ctx.fillStyle = 'black';
      this.ctx.font = 'bold 16px sans-serif';
      for (const ui of this.mapData.ui) {
        if (ui.type === 'label') {
          const [x, y] = ui.position;
          this.ctx.fillText(ui.content, x * this.cellSize, (y + 1) * this.cellSize);
        }
      }
    }
  }

  #drawTiles(tile) {
    if (tile.area) {
      const [[sx, sy], [ex, ey]] = tile.area;
      for (let y = sy; y <= ey; y++) {
        for (let x = sx; x <= ex; x++) {
          this.#fillTile(tile.type, x, y);
        }
      }
    } else if (tile.position) {
      const [x0, y0] = tile.position;
      const [w, h] = tile.size || [1, 1];
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          this.#fillTile(tile.type, x0 + x, y0 + y);
        }
      }
    } else if (tile.line) {
      const [[sx, sy], [ex, ey]] = tile.line;
      const dx = Math.sign(ex - sx);
      const dy = Math.sign(ey - sy);
      const len = Math.max(Math.abs(ex - sx), Math.abs(ey - sy));
      for (let i = 0; i <= len; i++) {
        this.#fillTile(tile.type, sx + dx * i, sy + dy * i);
      }
    }
  }

  #fillTile(type, x, y) {
    const colors = {
      grass: '#77aa77',
      soil: '#aa8855',
      rock: '#888888',
      building: '#5555aa',
      path: '#dcb35c'
    };
    this.ctx.fillStyle = colors[type] || '#000000';
    this.ctx.fillRect(
      x * this.cellSize,
      y * this.cellSize,
      this.cellSize,
      this.cellSize
    );
  }

  #drawObject(obj) {
    const colors = {
      slime: '#00cc88',
      hero_corpse: '#884488'
    };
    const [x, y] = obj.position;
    this.ctx.fillStyle = colors[obj.type] || '#000';
    this.ctx.fillRect(
      x * this.cellSize + 2,
      y * this.cellSize + 2,
      this.cellSize - 4,
      this.cellSize - 4
    );
  }
}

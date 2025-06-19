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

    // Use emoji for hero visualization for better visibility in tests
    this.ctx.font = `${this.cellSize}px serif`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    heroes.forEach(h => {
      this.ctx.fillText(
        '🦸',
        h.x * this.cellSize + this.cellSize / 2,
        h.y * this.cellSize + this.cellSize / 2
      );
    });
  }
}


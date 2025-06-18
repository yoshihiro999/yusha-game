export class MapRenderer {
  constructor(canvas, map, heroes = []) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.map = map;
    this.heroes = heroes;
    this.cellSize = 12;
    canvas.width = map.width * this.cellSize;
    canvas.height = map.height * this.cellSize;
  }

  setHeroes(heroes) {
    this.heroes = heroes;
  }

  render() {
    for (let y = 0; y < this.map.height; y++) {
      for (let x = 0; x < this.map.width; x++) {
        const tile = this.map.tiles[y][x];
        const mana = tile.mana;
        const nutrients = tile.nutrients;
        this.ctx.fillStyle = `rgb(${mana * 30}, ${nutrients * 30}, 100)`;
        this.ctx.fillRect(
          x * this.cellSize,
          y * this.cellSize,
          this.cellSize,
          this.cellSize
        );
      }
    }

    // draw heroes
    this.ctx.fillStyle = 'blue';
    for (const h of this.heroes) {
      this.ctx.fillRect(
        h.ai.x * this.cellSize,
        h.ai.y * this.cellSize,
        this.cellSize,
        this.cellSize
      );
    }
  }
}


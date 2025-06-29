export class HeroAI {
  constructor(startX, startY) {
    this.x = startX;
    this.y = startY;
    this.dirIndex = 0; // 0:E,1:S,2:W,3:N
    this.visited = new Map();
    this._markVisited(startX, startY);
  }

  reset(x = 0, y = 0) {
    this.x = x;
    this.y = y;
    this.dirIndex = 0;
    this.visited = new Map();
    this._markVisited(x, y);
  }

  _markVisited(x, y) {
    const key = `${x},${y}`;
    const count = this.visited.get(key) || 0;
    this.visited.set(key, count + 1);
  }

  _getVisitCount(x, y) {
    return this.visited.get(`${x},${y}`) || 0;
  }

  getNextMove(map) {
    const allDirs = [
      [1, 0], // E
      [0, 1], // S
      [-1, 0], // W
      [0, -1] // N
    ];

    const options = [];
    for (const offset of [1, 0, 3, 2]) { // right, forward, left, back
      const idx = (this.dirIndex + offset) % 4;
      const d = allDirs[idx];
      const nx = this.x + d[0];
      const ny = this.y + d[1];
      if (
        nx >= 0 &&
        ny >= 0 &&
        nx < map.width &&
        ny < map.height &&
        map.tiles[ny][nx].type === 'path'
      ) {
        options.push({ dir: d, idx, visit: this._getVisitCount(nx, ny) });
      }
    }

    if (options.length === 0) return null;

    options.sort((a, b) => a.visit - b.visit);
    const choice = options[0];
    this.dirIndex = choice.idx;
    this.x += choice.dir[0];
    this.y += choice.dir[1];
    this._markVisited(this.x, this.y);
    return { x: this.x, y: this.y };
  }
}

if (typeof window !== 'undefined') {
  window.HeroAI = HeroAI;
}


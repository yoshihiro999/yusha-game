export class HeroAI {
  constructor(startX, startY) {
    this.x = startX;
    this.y = startY;
    this.visited = new Set([`${this.x},${this.y}`]);
  }

  reset(x = 0, y = 0) {
    this.x = x;
    this.y = y;
    this.visited = new Set([`${x},${y}`]);
  }

  getNextMove(map) {
    const dirs = [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1]
    ].filter(d => {
      const nx = this.x + d[0];
      const ny = this.y + d[1];
      return (
        nx >= 0 &&
        ny >= 0 &&
        nx < map.width &&
        ny < map.height &&
        map.tiles[ny][nx].type === 'path' &&
        !this.visited.has(`${nx},${ny}`)
      );
    });

    if (dirs.length === 0) return null;
    const dir = randChoice(dirs);
    this.x += dir[0];
    this.y += dir[1];
    this.visited.add(`${this.x},${this.y}`);
    return { x: this.x, y: this.y };
  }
}

if (typeof window !== 'undefined') {
  window.HeroAI = HeroAI;
}


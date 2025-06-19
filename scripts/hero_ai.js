export class HeroAI {
  constructor(startX, startY) {
    this.x = startX;
    this.y = startY;
    this.visited = new Set([`${this.x},${this.y}`]);
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
    const dir = dirs[Math.floor(Math.random() * dirs.length)];
    this.x += dir[0];
    this.y += dir[1];
    this.visited.add(`${this.x},${this.y}`);
    return { x: this.x, y: this.y };
  }
}


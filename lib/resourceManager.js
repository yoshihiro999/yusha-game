export function generateMap(width, height, defaultTile) {
  const tiles = [];
  for (let y = 0; y < height; y++) {
    const row = [];
    for (let x = 0; x < width; x++) {
      row.push({
        nutrients: defaultTile.nutrients,
        mana: defaultTile.mana,
        monster: null,
        type: 'soil'
      });
    }
    tiles.push(row);
  }
  return { width, height, tiles };
}

export class ResourceManager {
  constructor(config, mapData) {
    this.config = Object.assign(
      {
        maxNutrients: 20,
        maxMana: 20,
        absorbLimit: 10
      },
      config
    );
    this.map = mapData;
    this.wave = 1;
  }

  nextWave() {
    this.wave += 1;
  }

  distributeResources(x, y, amountNutrient = 10, amountMana = 10) {
    const dirs = [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
      [1, 1],
      [1, -1],
      [-1, 1],
      [-1, -1]
    ];

    // weight: orthogonal > diagonal for distance減衰
    const weights = dirs.map(d => (Math.abs(d[0]) + Math.abs(d[1]) === 1 ? 1 : 0.7));
    const weightSum = weights.reduce((a, b) => a + b, 0);

    dirs.forEach((d, idx) => {
      const nx = x + d[0];
      const ny = y + d[1];
      if (
        nx < 0 ||
        ny < 0 ||
        nx >= this.map.width ||
        ny >= this.map.height
      ) {
        return;
      }
      const tile = this.map.tiles[ny][nx];
      if (tile.type && tile.type !== 'soil') return; // 通路・壁には還元しない

      const shareN = Math.round((amountNutrient * weights[idx]) / weightSum);
      const shareM = Math.round((amountMana * weights[idx]) / weightSum);

      const overflowN = Math.max(
        0,
        tile.nutrients + shareN - this.config.maxNutrients
      );
      const overflowM = Math.max(
        0,
        tile.mana + shareM - this.config.maxMana
      );

      tile.nutrients = Math.min(
        this.config.maxNutrients,
        tile.nutrients + shareN
      );
      tile.mana = Math.min(this.config.maxMana, tile.mana + shareM);

      if (overflowN > 0 || overflowM > 0) {
        this.distributeResources(nx, ny, overflowN, overflowM);
      }
    });
  }

  absorbResources(monster) {
    if (!monster || monster.tier !== '下位') return;

    let pos = null;
    for (let y = 0; y < this.map.height; y++) {
      for (let x = 0; x < this.map.width; x++) {
        if (this.map.tiles[y][x].monster === monster) {
          pos = { x, y };
          break;
        }
      }
      if (pos) break;
    }
    if (!pos) return;

    const tile = this.map.tiles[pos.y][pos.x];
    const take = Math.min(this.config.absorbLimit, tile.nutrients);
    if (take <= 0) return;
    tile.nutrients -= take;
    monster.nutrients = (monster.nutrients || 0) + take;
  }
}


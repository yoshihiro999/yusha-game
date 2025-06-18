export function generateMap(width, height, defaultTile) {
  const tiles = [];
  for (let y = 0; y < height; y++) {
    const row = [];
    for (let x = 0; x < width; x++) {
      row.push({
        nutrients: defaultTile.nutrients,
        mana: defaultTile.mana,
        monster: null
      });
    }
    tiles.push(row);
  }
  return { width, height, tiles };
}

export class ResourceManager {
  constructor(config, mapData) {
    this.config = config;
    this.map = mapData;
    this.wave = 1;
  }

  nextWave() {
    this.wave += 1;
  }
}


// Monster AI utilities and behaviour definitions

function inBounds(x, y, width, height) {
  return x >= 0 && y >= 0 && x < width && y < height;
}

function getValidDirs(x, y, map) {
  const dirs = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1]
  ];
  return dirs.filter(d => {
    const nx = x + d[0];
    const ny = y + d[1];
    return (
      inBounds(nx, ny, map[0].length, map.length) &&
      map[ny][nx].type === 'path'
    );
  });
}

function moveToward(x, y, tx, ty) {
  const dx = tx > x ? 1 : tx < x ? -1 : 0;
  const dy = ty > y ? 1 : ty < y ? -1 : 0;
  return [dx, dy];
}

function highestResourceDir(x, y, map) {
  let bestDir = randChoice(getValidDirs(x, y, map));
  let best = -Infinity;
  for (const d of getValidDirs(x, y, map)) {
    const nx = x + d[0];
    const ny = y + d[1];
    const tile = map[ny][nx];
    const value = tile.nutrients + tile.mana;
    if (value > best && !tile.monster) {
      best = value;
      bestDir = d;
    }
  }
  return bestDir;
}

function heroInRange(x, y, hero, range) {
  return Math.abs(hero.x - x) + Math.abs(hero.y - y) <= range;
}

function findNearestHero(monster, heroes) {
  if (!heroes || heroes.length === 0) return null;
  let nearest = null;
  let minDist = Infinity;
  for (const h of heroes) {
    const dist = Math.abs(monster.x - h.x) + Math.abs(monster.y - h.y);
    if (dist < minDist) {
      minDist = dist;
      nearest = h;
    }
  }
  return nearest;
}

function decideMonsterMove(monster, x, y, map, hero) {
  const dirs = getValidDirs(x, y, map);
  // fallback random direction
  let dir = randChoice(dirs);

  switch (monster.species) {
    case 'スライム族':
      if (monster.tier === '中位') {
        dir = highestResourceDir(x, y, map);
      } else if (monster.tier === '上位') {
        if (heroInRange(x, y, hero, 2)) {
          dir = moveToward(x, y, hero.x, hero.y);
        } else {
          dir = highestResourceDir(x, y, map);
        }
      }
      break;
    case '獣族':
      if (monster.tier === '中位') {
        if (heroInRange(x, y, hero, 3)) {
          monster.memory = { x: hero.x, y: hero.y };
        }
        if (monster.memory) {
          dir = moveToward(x, y, monster.memory.x, monster.memory.y);
          if (monster.memory.x === x && monster.memory.y === y) monster.memory = null;
        }
      } else if (monster.tier === '上位') {
        if (heroInRange(x, y, hero, 2)) {
          dir = moveToward(x, y, hero.x, hero.y);
        }
      }
      break;
    case '植物族':
      dir = highestResourceDir(x, y, map);
      break;
    case '昆虫族':
      if (!monster.dir) monster.dir = randChoice(dirs);
      if (monster.tier === '中位') {
        monster.steps = (monster.steps || 0) + 1;
        if (monster.steps >= 3) {
          monster.dir = randChoice(dirs);
          monster.steps = 0;
        }
      }
      dir = monster.dir;
      if (!dirs.some(d => d[0] === dir[0] && d[1] === dir[1])) {
        monster.dir = randChoice(dirs);
        dir = monster.dir;
      }
      break;
    case 'アンデッド族':
      if (monster.tier !== '下位' && heroInRange(x, y, hero, 2)) {
        dir = moveToward(x, y, hero.x, hero.y);
      }
      break;
    case '魔族':
      if (monster.tier === '中位' && heroInRange(x, y, hero, 2)) {
        hero.hp -= monster.atk;
      } else if (monster.tier === '上位') {
        if (!heroInRange(x, y, hero, 1)) {
          // teleport next to hero
          const options = getValidDirs(hero.x, hero.y, map);
          const tdir = randChoice(options);
          return [hero.x + tdir[0] - x, hero.y + tdir[1] - y];
        }
      }
      break;
  }
  return dir;
}

function afterMonsterMove(monster, fromTile) {
  if (monster.species === '魔族' && monster.tier === '下位') {
    fromTile.fire = 3;
  }
  if (monster.species === 'アンデッド族' && monster.tier === '下位') {
    monster.hp += 1;
  }
}

// expose for game.js
function processMonsterTurn(monster, x, y, map, resourceManager, monsterDefs = {}, hero = null) {
  const def = monsterDefs[monster.id] || {};

  monster.age = (monster.age || 0) + 1;
  if (def.growthTurns && monster.age >= def.growthTurns && def.evolvedTo) {
    monster.id = def.evolvedTo;
    monster.age = 0;
  }

  const mapTiles = map.tiles || map;
  const dirs = getValidDirs(x, y, mapTiles);
  if (dirs.length === 0) return;

  let dir = window.monsterAI.decideMonsterMove(monster, x, y, mapTiles, hero);
  if (def.prey && def.prey.length > 0) {
    const targetDir = dirs.find(d => {
      const nx = x + d[0];
      const ny = y + d[1];
      const tile = map.tiles ? map.tiles[ny][nx] : map[ny][nx];
      return tile.monster && def.prey.includes(tile.monster.id);
    });
    if (targetDir) dir = targetDir;
  }

  const nx = x + dir[0];
  const ny = y + dir[1];
  if (!inBounds(nx, ny, mapTiles[0].length, mapTiles.length)) {
    return;
  }

  const fromTile = mapTiles[y][x];
  const toTile = mapTiles[ny][nx];

  if (toTile.monster && def.prey && def.prey.includes(toTile.monster.id)) {
    resourceManager.spreadNutrients(nx, ny, toTile.monster.maxHP || 1);
    monster.mp = (monster.mp || 0) + (toTile.monster.mp || 0);
    toTile.monster = monster;
    fromTile.monster = null;
  } else if (!toTile.monster) {
    toTile.monster = monster;
    fromTile.monster = null;
  }

  const gained = resourceManager.absorbMana(nx, ny);
  monster.mp = (monster.mp || 0) + gained;

  monster.x = nx;
  monster.y = ny;
}

function processAllMonsters(monsters, heroes, map, resourceManager, monsterDefs = {}) {
  const tiles = map.tiles || map;
  const width = map.width || (tiles[0] ? tiles[0].length : 0);
  const height = map.height || tiles.length;
  const list = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const m = tiles[y][x].monster;
      if (m) list.push({ m, x, y });
    }
  }
  list.forEach(({ m, x, y }) => {
    const hero = findNearestHero(m, heroes);
    processMonsterTurn(m, x, y, map, resourceManager, monsterDefs, hero);
  });
}

window.monsterAI = {
  decideMonsterMove,
  afterMonsterMove,
  processMonsterTurn,
  processAllMonsters
};

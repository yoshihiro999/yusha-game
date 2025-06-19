const gridSize = 40;
const cellSize = 15;
const biomes = {
  grass: { nutrients: 5, mana: 2, color: '#88cc88' },
  swamp: { nutrients: 3, mana: 5, color: '#88aaaa' },
  volcano: { nutrients: 1, mana: 8, color: '#cc8888' }
};

const heroBaseStats = { hp: 10, mp: 5, atk: 3 };

let canvas, ctx;
let map = [];
let monsters = [];
let hero;
let demonLord = { x: 20, y: 20, captured: false, timer: 0 };
let visited = new Set();
let wave = 1;

function saveState() {
  saveGameState({
    map,
    hero,
    demonLord,
    visited: Array.from(visited),
    wave
  });
}

function loadState() {
  const data = loadGameState();
  if (!data) return false;
  map = data.map;
  hero = data.hero;
  demonLord = data.demonLord;
  visited = new Set(data.visited);
  wave = data.wave;
  return true;
}

function randChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function createMap() {
  map = [];
  for (let y = 0; y < gridSize; y++) {
    const row = [];
    for (let x = 0; x < gridSize; x++) {
      const biomeKey = randChoice(Object.keys(biomes));
      const b = biomes[biomeKey];
      row.push({
        biome: biomeKey,
        nutrients: b.nutrients,
        mana: b.mana,
        monster: null,
        fire: 0,
        type: 'soil'
      });
    }
    map.push(row);
  }

  for (let x = 0; x <= demonLord.x; x++) {
    map[0][x].type = 'path';
  }
  for (let y = 0; y <= demonLord.y; y++) {
    map[y][demonLord.x].type = 'path';
  }
}

function spawnHero() {
  hero = {
    x: 0,
    y: 0,
    hp: heroBaseStats.hp,
    atk: heroBaseStats.atk,
    state: 'pursuit' // 'pursuit' or 'escape'
  };
  visited = new Set(['0,0']);
}

function spawnMonster(x, y) {
  const speciesList = ['スライム族', '獣族', '植物族', '昆虫族', 'アンデッド族', '魔族'];
  const tiers = ['下位', '中位', '上位'];
  const species = randChoice(speciesList);
  const tier = randChoice(tiers);
  map[y][x].monster = {
    stage: 0,
    nutrients: 0,
    hp: 8,
    atk: 2,
    species,
    tier,
    age: 0
  };
}

function heroMove() {
  const dirs = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1]
  ].filter(d => {
    const nx = hero.x + d[0];
    const ny = hero.y + d[1];
    return (
      nx >= 0 &&
      ny >= 0 &&
      nx < gridSize &&
      ny < gridSize &&
      map[ny][nx].type === 'path' &&
      !visited.has(`${nx},${ny}`)
    );
  });
  if (dirs.length === 0) return; // stuck
  const dir = randChoice(dirs);
  hero.x += dir[0];
  hero.y += dir[1];
  visited.add(`${hero.x},${hero.y}`);
  const tile = map[hero.y][hero.x];
  if (tile.fire && tile.fire > 0) {
    hero.hp -= 1;
  }
}

function fight(monster, tile) {
  // simple combat: hero wins but loses 1 hp per stage
  hero.hp -= monster.stage + 1;
  if (hero.hp <= 0) return 'heroDead';
  tile.monster = null;
  // return resources
  tile.nutrients += monster.nutrients;
  return 'monsterDead';
}

function distributeResources(x, y) {
  const dirs = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1]
  ];
  dirs.forEach(d => {
    const nx = x + d[0];
    const ny = y + d[1];
    if (nx >= 0 && ny >= 0 && nx < gridSize && ny < gridSize) {
      map[ny][nx].nutrients += 5;
      map[ny][nx].mana += 5;
    }
  });
}

function autoBattle(monster, mx, my, heroFirst) {
  console.log('--- 戦闘開始 ---');
  console.log(`勇者HP:${hero.hp} vs モンスターHP:${monster.hp}`);
  let heroTurn = heroFirst;
  while (hero.hp > 0 && monster.hp > 0) {
    if (heroTurn) {
      monster.hp -= hero.atk;
      console.log(`勇者の攻撃 → ${hero.atk}ダメージ (敵残り${Math.max(monster.hp, 0)})`);
    } else {
      hero.hp -= monster.atk;
      console.log(`モンスターの攻撃 → ${monster.atk}ダメージ (勇者残り${Math.max(hero.hp, 0)})`);
    }
    heroTurn = !heroTurn;
  }
  if (hero.hp <= 0) {
    console.log('勇者チームは敗北した...');
    distributeResources(hero.x, hero.y);
    return 'heroDead';
  } else {
    console.log('モンスターを倒した！');
    map[my][mx].monster = null;
    distributeResources(mx, my);
    return 'monsterDead';
  }
}

function monsterTurn() {
  const moves = [];
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      const m = map[y][x].monster;
      if (!m) continue;
      const dir = window.monsterAI.decideMonsterMove(m, x, y, map, hero);
      moves.push({ m, fromX: x, fromY: y, dx: dir[0], dy: dir[1] });
    }
  }

  moves.forEach(move => {
    const { m, fromX, fromY, dx, dy } = move;
    const fx = fromX;
    const fy = fromY;
    const tx = fx + dx;
    const ty = fy + dy;
    if (tx < 0 || ty < 0 || tx >= gridSize || ty >= gridSize) return;
    const targetTile = map[ty][tx];
    const fromTile = map[fy][fx];

    window.monsterAI.afterMonsterMove(m, fromTile);

    if (hero.x === tx && hero.y === ty) {
      const result = autoBattle(m, tx, ty, false);
      if (result === 'heroDead') return;
    } else if (!targetTile.monster) {
      targetTile.monster = m;
      fromTile.monster = null;
    }

    if (targetTile.nutrients > 0) {
      targetTile.nutrients -= 1;
      m.nutrients = (m.nutrients || 0) + 1;
    }
    m.age += 1;
    if (m.stage < 2 && m.nutrients >= (m.stage + 1) * 3) {
      m.stage += 1;
      m.nutrients = 0;
      m.hp += 4;
      m.atk += 1;
    }

    if (m.species === '植物族' && m.tier === '中位' && m.age % 5 === 0) {
      const dirs = [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1]
      ];
      for (const d of dirs) {
        const sx = tx + d[0];
        const sy = ty + d[1];
        if (
          sx >= 0 &&
          sy >= 0 &&
          sx < gridSize &&
          sy < gridSize &&
          !map[sy][sx].monster
        ) {
          map[sy][sx].monster = {
            stage: 0,
            nutrients: 0,
            hp: 8,
            atk: 2,
            species: '植物族',
            tier: '下位',
            age: 0
          };
          break;
        }
      }
    }

    if (m.species === '植物族' && m.tier === '上位') {
      if (Math.abs(hero.x - tx) + Math.abs(hero.y - ty) === 1) {
        hero.hp -= 1; // trap damage
      }
    }
  });
}

function checkDemonLord() {
  if (hero.x === demonLord.x && hero.y === demonLord.y) {
    demonLord.timer += 1;
    if (demonLord.timer >= 3) {
      demonLord.captured = true;
    }
  } else {
    demonLord.timer = 0;
  }
}

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      const tile = map[y][x];
      ctx.fillStyle = biomes[tile.biome].color;
      ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
      if (tile.fire && tile.fire > 0) {
        ctx.fillStyle = 'rgba(255,100,0,0.5)';
        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
        tile.fire -= 1;
      }
      if (tile.monster) {
        // Draw monster using emoji for easier distinction
        ctx.font = `${cellSize}px serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(
          '👾',
          x * cellSize + cellSize / 2,
          y * cellSize + cellSize / 2
        );
      }
    }
  }
  // hero using emoji
  ctx.font = `${cellSize}px serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(
    '🦸',
    hero.x * cellSize + cellSize / 2,
    hero.y * cellSize + cellSize / 2
  );
  // demon lord with emoji
  ctx.fillText(
    demonLord.timer > 0 ? '😈' : '👿',
    demonLord.x * cellSize + cellSize / 2,
    demonLord.y * cellSize + cellSize / 2
  );
}

function nextTurn() {
  heroMove();

  const dirs = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1]
  ];
  for (const d of dirs) {
    const nx = hero.x + d[0];
    const ny = hero.y + d[1];
    if (nx >= 0 && ny >= 0 && nx < gridSize && ny < gridSize) {
      const m = map[ny][nx].monster;
      if (m) {
        const result = autoBattle(m, nx, ny, hero.state === 'pursuit');
        if (result === 'heroDead') {
          document.getElementById('status').textContent = `勇者は倒れた。Wave ${wave} 敗北`;
          render();
          return;
        }
        break;
      }
    }
  }

  monsterTurn();
  checkDemonLord();
  render();
  if (demonLord.captured) {
    document.getElementById('status').textContent = `魔王が連れ去られた。ゲームオーバー`;
    return;
  }
  if (hero.hp <= 0) {
    document.getElementById('status').textContent = `勇者は倒れた。Wave ${wave} 勝利`;
  } else {
    document.getElementById('status').textContent = `Wave ${wave} : Hero HP ${hero.hp}`;
  }
}

window.addEventListener('DOMContentLoaded', () => {
  canvas = document.getElementById('gameCanvas');
  ctx = canvas.getContext('2d');
  canvas.width = gridSize * cellSize;
  canvas.height = gridSize * cellSize;

  if (!loadState()) {
    createMap();
    spawnHero();
    for (let i = 0; i < 5; i++) {
      let x, y;
      do {
        x = Math.floor(Math.random() * gridSize);
        y = Math.floor(Math.random() * gridSize);
      } while (map[y][x].type !== 'path');
      spawnMonster(x, y);
    }
  }
  document.getElementById('nextTurn').addEventListener('click', () => {
    nextTurn();
    saveState();
  });
  render();
});

window.dig = function (x, y) {
  if (map[y] && map[y][x]) {
    map[y][x].type = 'path';
    render();
  }
};

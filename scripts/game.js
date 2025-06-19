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
        monster: null
      });
    }
    map.push(row);
  }
}

function spawnHero() {
  hero = { x: 0, y: 0, hp: heroBaseStats.hp };
  visited = new Set(['0,0']);
}

function spawnMonster(x, y) {
  map[y][x].monster = { stage: 0, nutrients: 0 };
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
    return nx >= 0 && ny >= 0 && nx < gridSize && ny < gridSize && !visited.has(`${nx},${ny}`);
  });
  if (dirs.length === 0) return; // stuck
  const dir = randChoice(dirs);
  hero.x += dir[0];
  hero.y += dir[1];
  visited.add(`${hero.x},${hero.y}`);
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

function monsterTurn() {
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      const m = map[y][x].monster;
      if (!m) continue;
      if (map[y][x].nutrients > 0) {
        map[y][x].nutrients -= 1;
        m.nutrients += 1;
      }
      if (m.stage < 2 && m.nutrients >= (m.stage + 1) * 3) {
        m.stage += 1;
        m.nutrients = 0;
      }
    }
  }
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
      if (tile.monster) {
        ctx.fillStyle = ['#444', '#222', '#000'][tile.monster.stage];
        ctx.beginPath();
        ctx.arc(
          x * cellSize + cellSize / 2,
          y * cellSize + cellSize / 2,
          cellSize / 3,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
    }
  }
  // hero
  ctx.fillStyle = 'blue';
  ctx.fillRect(hero.x * cellSize, hero.y * cellSize, cellSize, cellSize);
  // demon lord
  ctx.fillStyle = demonLord.timer > 0 ? 'pink' : 'red';
  ctx.fillRect(demonLord.x * cellSize, demonLord.y * cellSize, cellSize, cellSize);
}

function nextTurn() {
  heroMove();
  const tile = map[hero.y][hero.x];
  if (tile.monster) {
    const result = fight(tile.monster, tile);
    if (result === 'heroDead') {
      document.getElementById('status').textContent = `勇者は倒れた。Wave ${wave} 敗北`;
      return;
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
      const x = Math.floor(Math.random() * gridSize);
      const y = Math.floor(Math.random() * gridSize);
      spawnMonster(x, y);
    }
  }
  document.getElementById('nextTurn').addEventListener('click', () => {
    nextTurn();
    saveState();
  });
  render();
});

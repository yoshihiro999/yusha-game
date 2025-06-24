const gridSize = 40;
const cellSize = 15;
const BASE_WIDTH = 640;
const BASE_HEIGHT = 360;
const biomes = {
  grass: { nutrients: 5, mana: 2, color: '#88cc88' },
  swamp: { nutrients: 3, mana: 5, color: '#88aaaa' },
  volcano: { nutrients: 1, mana: 8, color: '#cc8888' }
};

// base HP/MP shared by all hero classes
const heroBaseStats = { hp: 10, mp: 5 };

// base combat stats for each hero job
const heroClassStats = {
  hero: { className: '勇者', physAtk: 15, magAtk: 5, physDef: 10, magDef: 5 },
  warrior: { className: '戦士', physAtk: 10, magAtk: 2, physDef: 15, magDef: 5 },
  priest: { className: '僧侶', physAtk: 6, magAtk: 10, physDef: 8, magDef: 12 },
  mage: { className: '魔法使い', physAtk: 4, magAtk: 16, physDef: 6, magDef: 15 }
};

// monster defense values and attack type tendencies by species
const monsterDefenseTable = {
  'スライム族': { physDef: 1, magDef: 4 },
  '獣族': { physDef: 3, magDef: 1 },
  '植物族': { physDef: 2, magDef: 2 },
  '昆虫族': { physDef: 4, magDef: 1 },
  'アンデッド族': { physDef: 2, magDef: 3 },
  '魔族': { physDef: 3, magDef: 4 }
};

const monsterAttackTypeTable = {
  'スライム族': 'magical',
  '獣族': 'physical',
  '植物族': 'magical',
  '昆虫族': 'physical',
  'アンデッド族': 'physical',
  '魔族': 'magical'
};

// 技名テーブル
const heroAttackTable = {
  hero: [
    '斬撃',
    'パワースラッシュ',
    'ブレイブクロス',
    'オーラブレード',
    'ライジングセイバー',
    'ドラゴンクレスト',
    'カオスブレイカー',
    'ホーリーブレード',
    'アルティメットソード',
    'レジェンドフィニッシュ'
  ],
  warrior: [
    '一撃打ち',
    'ハンマーブロー',
    'ダブルインパクト',
    'バーストクラッシュ',
    '激震烈破',
    '獅子奮迅',
    'ウォークライクレイヴ',
    'バーサーカーラッシュ',
    'ギガクラッシャー',
    'アースクラッカー'
  ],
  priest: [
    'ヒールスマイト',
    'セイクリッドブロー',
    'ホーリーライト',
    'ジャッジメント',
    'ディバインスマッシュ',
    '聖光裂破',
    'セラフィムストライク',
    'アークインパルス',
    'ラグナロクガード',
    'ゴッドレクイエム'
  ],
  mage: [
    'ファイアボルト',
    'アイススパイク',
    'ライトニング',
    'フレイムランス',
    'ストームブラスト',
    'フレアバースト',
    'メテオストライク',
    'ギガサンダー',
    'アストラルゲート',
    'アルティメットスペル'
  ]
};

const monsterAttackTable = {
  'スライム族': [
    '体当たり',
    '粘液飛ばし',
    'とろける触手',
    'ぬるぬる連打',
    'スライムボム',
    '腐食スプラッシュ',
    'アシッドブレイク',
    '粘塊崩壊',
    'ゲルデストロイ',
    'キングスライムクラッシュ'
  ],
  '獣族': [
    '噛みつき',
    '爪ひっかき',
    '突進',
    '牙連撃',
    '咆哮',
    '地獄牙',
    '狂乱乱舞',
    '破滅クロー',
    '獣王烈爪',
    '闇炎咆哮'
  ],
  '植物族': [
    'つる攻撃',
    '胞子飛ばし',
    '根っこ締め付け',
    '吸血花',
    '寄生蔓',
    '絞殺花嵐',
    'トゲトゲ狂宴',
    '捕食の華',
    '樹海崩壊',
    '世界樹の裁き'
  ],
  '昆虫族': [
    '突刺し',
    '硬殻ぶつかり',
    '毒針攻撃',
    '羽音斬り',
    '大顎クラッシュ',
    '毒牙連撃',
    '甲殻粉砕',
    '獣喰いバイト',
    '悪夢羽ばたき',
    '皇帝穿孔'
  ],
  'アンデッド族': [
    '骨打ち',
    '呪いの吐息',
    '腐敗タッチ',
    '魂吸い',
    '地獄の手招き',
    '亡者の咆哮',
    '血塗れの鎌',
    '死者の舞踏',
    '冥界の解放',
    '終末の鎮魂歌'
  ],
  '魔族': [
    '影の爪',
    'ダークボルト',
    'ファイアブレス',
    '地獄の炎',
    '闇の衝撃',
    '悪魔の微笑',
    '魔王の従者',
    '虚無の波動',
    '深淵の咆哮',
    '魔界終焉斬'
  ]
};

function getAttackName(actor, isHero, wave = 1) {
  if (isHero) {
    const table = heroAttackTable[actor.job] || heroAttackTable.hero;
    const w = Math.max(1, Math.min(8, wave));
    const idx = Math.min(
      table.length - 1,
      Math.floor(((w - 1) / 8) * table.length)
    );
    return table[idx];
  } else {
    const table = monsterAttackTable[actor.species] || monsterAttackTable['スライム族'];
    let limit = table.length;
    if (actor.tier === '下位') limit = 4;
    else if (actor.tier === '中位') limit = 7;
    const idx = Math.floor(Math.random() * limit);
    return table[idx];
  }
}

const attackDialogues = {
  heroes: {
    default: [
      '{name}！これでもくらえ！',
      '必殺の{name}！',
      '{name}で決める！'
    ],
    'アルティメットスペル': [
      'これが究極魔法、{name}！！',
      '消え去れ！{name}!'
    ]
  },
  monsters: {
    '下位': {
      default: ['{name}!', 'グルル…{name}!', 'えいっ！{name}!']
    },
    '中位': {
      default: ['{name}!!', '喰らえ！{name}!', 'これで終わりだ、{name}!']
    },
    '上位': {
      default: ['{name}!!!', '滅びよ、{name}!', '力の限り、{name}!']
    }
  }
};

let speechBubbles = [];

function getAttackSpeech(actor, attackName, isHero) {
  if (isHero) {
    const table =
      attackDialogues.heroes[attackName] || attackDialogues.heroes.default;
    return randChoice(table).replace('{name}', attackName);
  }
  const tier = actor.tier || '下位';
  const tierData = attackDialogues.monsters[tier] || {};
  const list = tierData[attackName] || tierData.default || [attackName];
  return randChoice(list).replace('{name}', attackName);
}

function showSpeechBubble(x, y, text) {
  speechBubbles.push({ x, y, text, start: performance.now() });
}

function drawSpeechBubbles() {
  const now = performance.now();
  ctx.save();
  ctx.setTransform(gameScale, 0, 0, gameScale, offsetX, offsetY);
  ctx.font = '12px sans-serif';
  ctx.textAlign = 'center';
  speechBubbles = speechBubbles.filter(b => now - b.start < 2000);
  speechBubbles.forEach(b => {
    const px = b.x * cellSize + cellSize / 2;
    const py = b.y * cellSize - 4;
    const padding = 4;
    const textWidth = ctx.measureText(b.text).width + padding * 2;
    const textHeight = 14;
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.rect(px - textWidth / 2, py - textHeight - 10, textWidth, textHeight);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#000';
    ctx.fillText(b.text, px, py - 2);
  });
  ctx.restore();
}

function animationLoop() {
  render();
  drawSpeechBubbles();
  requestAnimationFrame(animationLoop);
}

let canvas, ctx;
let gameScale = 1;
let offsetX = 0;
let offsetY = 0;
let map = [];
let monsters = [];
let hero;
let demonLord = { x: 20, y: 20, captured: false, timer: 0 };
let heroAI;
let tm;
let battleLog = [];

function resizeCanvas() {
  const scale = Math.min(
    window.innerWidth / BASE_WIDTH,
    window.innerHeight / BASE_HEIGHT
  );
  canvas.style.width = `${BASE_WIDTH * scale}px`;
  canvas.style.height = `${BASE_HEIGHT * scale}px`;
}

function saveState() {
  saveGameState({
    map,
    hero,
    demonLord,
    heroVisited: heroAI ? Array.from(heroAI.visited) : [],
    stage: tm ? tm.currentStage : 1,
    wave: tm ? tm.currentWave : 1
  });
}

function loadState() {
  const data = loadGameState();
  if (!data) return false;
  map = data.map;
  hero = data.hero;
  attachHeroMethods(hero);
  if (!hero.className && hero.job && heroClassStats[hero.job]) {
    hero.className = heroClassStats[hero.job].className;
  }
  demonLord = data.demonLord;
  tm = new window.TurnManager(1, 3);
  tm.currentStage = data.stage || 1;
  tm.currentWave = data.wave || 1;
  heroAI = new window.HeroAI(hero.x, hero.y);
  if (data.heroVisited) {
    data.heroVisited.forEach(p => heroAI.visited.add(p));
  }
  return true;
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

function attachHeroMethods(h) {
  h.getEffectiveStats = function() {
    const stageBonus = Math.pow(1.183, tm.currentStage);
    const waveBonus = Math.pow(1.1, tm.currentWave);
    const mult = stageBonus * waveBonus;
    return {
      hp: this.baseHp * mult,
      mp: this.baseMp * mult,
      physAtk: this.physAtk * mult,
      magAtk: this.magAtk * mult,
      physDef: this.physDef * mult,
      magDef: this.magDef * mult
    };
  };
  h.getAttackType = function() {
    const stats = this.getEffectiveStats();
    return stats.physAtk >= stats.magAtk ? '物理' : '魔法';
  };
}

function createHero(job = 'hero') {
  const base = heroClassStats[job] || heroClassStats.hero;
  const h = {
    job,
    className: base.className,
    x: 0,
    y: 0,
    baseHp: heroBaseStats.hp,
    baseMp: heroBaseStats.mp,
    physAtk: base.physAtk,
    magAtk: base.magAtk,
    physDef: base.physDef,
    magDef: base.magDef,
    state: 'pursuit' // 'pursuit' or 'escape'
  };
  attachHeroMethods(h);
  const eff = h.getEffectiveStats();
  h.hp = eff.hp;
  h.mp = eff.mp;
  return h;
}

function spawnHero(job) {
  hero = createHero(job);
}

function spawnMonster(x, y) {
  const speciesList = ['スライム族', '獣族', '植物族', '昆虫族', 'アンデッド族', '魔族'];
  const tiers = ['下位', '中位', '上位'];
  const species = randChoice(speciesList);
  const tier = randChoice(tiers);
  const defs = monsterDefenseTable[species] || { physDef: 2, magDef: 2 };
  const attackType = monsterAttackTypeTable[species] || 'physical';
  map[y][x].monster = {
    stage: 0,
    nutrients: 0,
    hp: 8,
    atk: 2,
    species,
    tier,
    age: 0,
    physDef: defs.physDef,
    magDef: defs.magDef,
    attackType
  };
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

function addBattleLog(text) {
  battleLog.push(text);
  if (battleLog.length > 10) battleLog.shift();
}

function autoBattle(monster, mx, my, heroFirst) {
  addBattleLog('--- 戦闘開始 ---');
  addBattleLog(`勇者HP:${hero.hp} vs モンスターHP:${monster.hp}`);
  let heroTurn = heroFirst;
  while (hero.hp > 0 && monster.hp > 0) {
    if (heroTurn) {
      const stats = hero.getEffectiveStats();
      const atkType = hero.getAttackType();
      let dmg =
        atkType === '物理'
          ? stats.physAtk - monster.physDef
          : stats.magAtk - monster.magDef;
      dmg = Math.max(0, dmg);
      monster.hp -= dmg;
      const waveIndex = tm ? tm.getWaveIndex() + 1 : 1;
      const atkName = getAttackName(hero, true, waveIndex);
      addBattleLog(
        `${hero.className}の《${atkName}》 → ${dmg}ダメージ (敵残りHP ${Math.max(
          monster.hp,
          0
        )})`
      );
      showSpeechBubble(hero.x, hero.y, getAttackSpeech(hero, atkName, true));
    } else {
      const heroStats = hero.getEffectiveStats();
      const heroDef =
        (monster.attackType || 'physical') === 'physical'
          ? heroStats.physDef
          : heroStats.magDef;
      let dmg = monster.atk - heroDef;
      dmg = Math.max(0, dmg);
      hero.hp -= dmg;
      const atkName = getAttackName(monster, false);
      addBattleLog(
        `${monster.species}の《${atkName}》 → ${dmg}ダメージ (勇者残りHP ${Math.max(
          hero.hp,
          0
        )})`
      );
      showSpeechBubble(mx, my, getAttackSpeech(monster, atkName, false));
    }
    heroTurn = !heroTurn;
  }
  if (hero.hp <= 0) {
    addBattleLog('勇者チームは敗北した...');
    distributeResources(hero.x, hero.y);
    return 'heroDead';
  } else {
    addBattleLog('モンスターを倒した！');
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
            age: 0,
            physDef: monsterDefenseTable['植物族'].physDef,
            magDef: monsterDefenseTable['植物族'].magDef,
            attackType: monsterAttackTypeTable['植物族']
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
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.setTransform(gameScale, 0, 0, gameScale, offsetX, offsetY);
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

  drawSpeechBubbles();
  drawBattleLog();
}

function drawBattleLog() {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = 'white';
  ctx.font = '14px sans-serif';
  const padding = 10;
  const lineHeight = 16;
  const startY = BASE_HEIGHT - padding - lineHeight * battleLog.length;
  battleLog.forEach((text, i) => {
    ctx.fillText(text, padding, startY + i * lineHeight);
  });
}

function heroTurnPhase() {
  const next = heroAI.getNextMove({
    width: gridSize,
    height: gridSize,
    tiles: map
  });
  if (next) {
    hero.x = next.x;
    hero.y = next.y;
  }

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
          document.getElementById('status').textContent =
            `勇者は倒れた。Stage ${tm.currentStage} Wave ${tm.currentWave} 敗北`;
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
  updateStatus();
}

function updateStatus() {
  if (!tm) return;
  const status = document.getElementById('status');
  if (demonLord.captured) {
    status.textContent = '魔王が連れ去られた。ゲームオーバー';
    return;
  }
  if (hero.hp <= 0) {
    status.textContent = `勇者は倒れた。Stage ${tm.currentStage} Wave ${tm.currentWave}`;
    return;
  }
  const atkType = hero.getAttackType();
  status.textContent =
    `Stage ${tm.currentStage} Wave ${tm.currentWave} - Phase: ${tm.phase} ` +
    `HP:${hero.hp} クラス:${hero.className} 攻撃:${atkType}`;
}

window.addEventListener('DOMContentLoaded', () => {
  canvas = document.getElementById('gameCanvas');
  ctx = canvas.getContext('2d');
  canvas.width = BASE_WIDTH;
  canvas.height = BASE_HEIGHT;

  const gameWidth = gridSize * cellSize;
  const gameHeight = gridSize * cellSize;
  gameScale = Math.min(BASE_WIDTH / gameWidth, BASE_HEIGHT / gameHeight);
  offsetX = (BASE_WIDTH - gameWidth * gameScale) / 2;
  offsetY = (BASE_HEIGHT - gameHeight * gameScale) / 2;
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  if (!loadState()) {
    tm = new window.TurnManager(1, 3);
    tm.on('prepare', async () => {
      createMap();
      await tm.nextPhase();
    });
    tm.on('placement', async () => {
      for (let i = 0; i < 5; i++) {
        let x, y;
        do {
          x = randomInt(0, gridSize - 1);
          y = randomInt(0, gridSize - 1);
        } while (map[y][x].type !== 'path');
        spawnMonster(x, y);
      }
      await tm.nextPhase();
    });
    tm.on('waveStart', () => {
      spawnHero();
      heroAI = new window.HeroAI(hero.x, hero.y);
    });
    tm.on('heroTurn', heroTurnPhase);
    tm.on('cleanup', async () => {
      await tm.nextPhase();
    });
    tm.on('waveEnd', async () => {
      await tm.nextPhase();
    });
    tm.on('transition', () => {});
    tm.start();
  }

  document.getElementById('nextTurn').addEventListener('click', async () => {
    await tm.nextPhase();
    saveState();
    render();
    updateStatus();
  });

  render();
  updateStatus();
  animationLoop();
});

window.dig = function (x, y) {
  if (map[y] && map[y][x]) {
    map[y][x].type = 'path';
    render();
  }
};

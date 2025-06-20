import mapData from '../data/layered_map.json' assert { type: 'json' };
import { renderMap } from './map_renderer.js';
import { generateMap, ResourceManager } from '../lib/resourceManager.js';

const tileSize = 20; // same as renderMap
let canvas, ctx;
let resourceMap, resourceManager;
let monsters = [];
let summonPoints = 100;
let selectedMonster = null;
const SUMMON_COST = 20;

function init() {
  canvas = document.getElementById('monsterCanvas');
  ctx = canvas.getContext('2d');

  renderMap(canvas, mapData);
  resourceMap = generateMap(mapData.size[0], mapData.size[1], {
    nutrients: 10,
    mana: 10
  });
  resourceManager = new ResourceManager({}, resourceMap);
  monsters = Array.from({ length: resourceMap.height }, () =>
    Array(resourceMap.width).fill(false)
  );

  canvas.addEventListener('click', onClick);

  document.querySelectorAll('.monster-select').forEach(btn => {
    btn.addEventListener('click', () => {
      document
        .querySelectorAll('.monster-select')
        .forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedMonster = btn.dataset.monster;
    });
  });

  const startBtn = document.getElementById('startWave');
  if (startBtn) {
    startBtn.addEventListener('click', () => {
      console.log('Wave started!');
    });
  }

  updateCost();
}

function onClick(e) {
  const rect = canvas.getBoundingClientRect();
  const x = Math.floor((e.clientX - rect.left) / tileSize);
  const y = Math.floor((e.clientY - rect.top) / tileSize);

  if (x < 0 || y < 0 || x >= resourceMap.width || y >= resourceMap.height) return;
  if (monsters[y][x]) return;
  if (!selectedMonster) return;
  if (summonPoints < SUMMON_COST) return;

  monsters[y][x] = true;
  summonPoints -= SUMMON_COST;
  updateCost();
  const result = resourceManager.absorbResources(x, y);
  draw();
  log(`(${x},${y}) -> nutrients:${result.nutrients} mana:${result.mana}`);
}

function draw() {
  renderMap(canvas, mapData);
  ctx.fillStyle = 'red';
  for (let y = 0; y < resourceMap.height; y++) {
    for (let x = 0; x < resourceMap.width; x++) {
      if (monsters[y][x]) {
        ctx.fillRect(x * tileSize + 4, y * tileSize + 4, tileSize - 8, tileSize - 8);
      }
    }
  }
}

function updateCost() {
  const el = document.getElementById('costLabel');
  if (el) el.textContent = `召喚コスト：${summonPoints}`;
}

function log(msg) {
  const el = document.getElementById('log');
  if (el) el.textContent = msg;
  console.log(msg);
}

window.addEventListener('DOMContentLoaded', init);

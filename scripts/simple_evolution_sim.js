const canvas = document.getElementById('monsterCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 400;
canvas.height = 400;

const gridSize = 10;
const cellSize = canvas.width / gridSize;

let monsters = Array.from({ length: gridSize }, () => Array(gridSize).fill(null));
let monsterData = {};
let lastClicked = null;

// モンスター定義読み込み（外部JSON）
fetch('../data/simple_monsters.json')
  .then(response => response.json())
  .then(data => {
    data.forEach(m => {
      monsterData[m.id] = m;
      const option = document.createElement('option');
      option.value = m.id;
      option.textContent = m.name;
      document.getElementById('monsterSelect').appendChild(option);
    });
  });

// 配置処理：Canvasクリックで魔物設置
canvas.addEventListener('click', e => {
  const rect = canvas.getBoundingClientRect();
  const x = Math.floor((e.clientX - rect.left) / cellSize);
  const y = Math.floor((e.clientY - rect.top) / cellSize);
  const selectedId = document.getElementById('monsterSelect').value;
  if (monsterData[selectedId]) {
    monsters[y][x] = { id: selectedId, age: 0, evolved: false };
    render();
    updateStatus(x, y);
    lastClicked = { x, y };
  }
});

// ボタン処理
document.getElementById('nextTurn').addEventListener('click', advanceTurn);
document.getElementById('reset').addEventListener('click', () => {
  monsters = Array.from({ length: gridSize }, () => Array(gridSize).fill(null));
  render();
  document.getElementById('status').textContent = '';
});

// ターン進行処理（成長＆進化）
function advanceTurn() {
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      const m = monsters[y][x];
      if (!m) continue;
      const data = monsterData[m.id];
      m.age += 1;
      if (!m.evolved && m.age >= (data.growthTurns || Infinity) && data.evolvedTo) {
        m.id = data.evolvedTo;
        m.evolved = true;
      }
    }
  }
  render();
  if (lastClicked) {
    const { x, y } = lastClicked;
    if (monsters[y][x]) {
      updateStatus(x, y);
    } else {
      document.getElementById('status').textContent = '';
    }
  }
}

// ステータス欄更新
function updateStatus(x, y) {
  const m = monsters[y][x];
  if (!m) {
    document.getElementById('status').textContent = '';
    return;
  }
  const data = monsterData[m.id];
  document.getElementById('status').textContent = `${data.name}（Age: ${m.age}）`;
}

// 描画処理
function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      const m = monsters[y][x];
      if (m) {
        const data = monsterData[m.id];
        ctx.fillStyle = data.color || '#cccccc';
        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
      }
    }
  }
}

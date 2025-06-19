let canvas, ctx;
const gridSize = 40;
const cellSize = 12;
let monsters = [];
let monsterData = {};
let selectedMonsterId = null;

async function loadMonsterData() {
  const res = await fetch("../data/monsters.json");
  const json = await res.json();
  monsterData = Object.fromEntries(json.map(m => [m.id, m]));
  populateMonsterSelect(json);
}

function populateMonsterSelect(data) {
  const select = document.getElementById("monsterSelect");
  data.forEach(monster => {
    const option = document.createElement("option");
    option.value = monster.id;
    option.textContent = monster.name;
    select.appendChild(option);
  });
}

function setupCanvas() {
  canvas = document.getElementById("monsterCanvas");
  ctx = canvas.getContext("2d");
  canvas.width = gridSize * cellSize;
  canvas.height = gridSize * cellSize;
  monsters = Array.from({ length: gridSize }, () =>
    Array.from({ length: gridSize }, () => null)
  );

  canvas.addEventListener("click", placeMonster);
  document.getElementById("nextTurn").addEventListener("click", advanceTurn);
  document.getElementById("reset").addEventListener("click", resetField);
  document.getElementById("monsterSelect").addEventListener("change", e => {
    selectedMonsterId = e.target.value;
  });

  selectedMonsterId = document.getElementById("monsterSelect").value;
  render();
}

function placeMonster(event) {
  const x = Math.floor(event.offsetX / cellSize);
  const y = Math.floor(event.offsetY / cellSize);
  if (!selectedMonsterId || monsters[y][x]) return;

  monsters[y][x] = {
    id: selectedMonsterId,
    age: 0,
    evolved: false
  };

  render();
  updateStatus(x, y);
}

function advanceTurn() {
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      let m = monsters[y][x];
      if (!m) continue;

      const data = monsterData[m.id];
      m.age += 1;
      if (!m.evolved && m.age >= data.growthTurns) {
        m.evolved = true;
      }
    }
  }
  render();
}

function resetField() {
  monsters = Array.from({ length: gridSize }, () =>
    Array.from({ length: gridSize }, () => null)
  );
  render();
  document.getElementById("status").textContent = "";
}

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      const m = monsters[y][x];
      if (m) {
        const data = monsterData[m.id];
        ctx.fillStyle = m.evolved ? data.evolvedColor : data.color;
        ctx.beginPath();
        ctx.arc(
          x * cellSize + cellSize / 2,
          y * cellSize + cellSize / 2,
          cellSize / 2.5,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
    }
  }
}

function updateStatus(x, y) {
  const m = monsters[y][x];
  if (!m) {
    document.getElementById("status").textContent = "";
    return;
  }

  const data = monsterData[m.id];
  document.getElementById("status").textContent =
    `${data.name}（Age: ${m.age}）` +
    (m.evolved ? ` → ${data.evolution}` : "");
}

window.addEventListener("DOMContentLoaded", async () => {
  await loadMonsterData();
  setupCanvas();
});

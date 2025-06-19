window.addEventListener('DOMContentLoaded', async () => {
  const res = await fetch('../data/monsters.json');
  const monsters = await res.json();
  const list = document.getElementById('monsterList');
  monsters.forEach(m => {
    const div = document.createElement('div');
    div.textContent = `${m.name} → ${m.evolution}`;
    list.appendChild(div);
  });
});

window.addEventListener('DOMContentLoaded', async () => {
  const res = await fetch('../data/heroes.json');
  const heroes = await res.json();
  const list = document.getElementById('heroList');
  heroes.forEach(h => {
    const div = document.createElement('div');
    div.textContent = `${h.name} (${h.role}) HP:${h.hp} MP:${h.mp}`;
    list.appendChild(div);
  });
});

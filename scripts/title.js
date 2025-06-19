window.addEventListener('DOMContentLoaded', () => {
  const continueBtn = document.getElementById('continueGame');
  if (loadGameState()) {
    continueBtn.disabled = false;
  }

  document.getElementById('newGame').addEventListener('click', () => {
    clearGameState();
    location.href = 'game.html';
  });

  continueBtn.addEventListener('click', () => {
    location.href = 'game.html';
  });
});

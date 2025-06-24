(function () {
  const layer = document.getElementById('speechLayer');
  window.showSpeechBubble = function (x, y, text) {
    if (!layer) return;
    const bubble = document.createElement('div');
    bubble.className = 'speech-bubble';
    bubble.textContent = text;
    const px = offsetX + x * cellSize * gameScale + (cellSize * gameScale) / 2;
    const py = offsetY + y * cellSize * gameScale;
    bubble.style.left = px + 'px';
    bubble.style.top = py + 'px';
    layer.appendChild(bubble);
    setTimeout(() => {
      if (bubble.parentNode) bubble.parentNode.removeChild(bubble);
    }, 1500);
  };
})();

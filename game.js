const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const restartBtn = document.getElementById('restart');

const state = {
  gravity: 0.28,
  moveSpeed: 3.4,
  jumpVelocity: -9,
  scrollingThreshold: 220,
  gameOver: false,
  score: 0,
  maxPlatformGap: 90,
  minPlatformGap: 55,
  keys: { left: false, right: false },
};

const player = {
  x: canvas.width / 2 - 18,
  y: canvas.height - 80,
  width: 36,
  height: 36,
  vx: 0,
  vy: -8,
};

const platforms = [];

function resetGame() {
  state.gameOver = false;
  state.score = 0;
  scoreEl.textContent = '0';
  restartBtn.hidden = true;

  player.x = canvas.width / 2 - 18;
  player.y = canvas.height - 80;
  player.vx = 0;
  player.vy = -8;

  platforms.length = 0;
  let y = canvas.height - 30;
  while (y > -1200) {
    createPlatform(y);
    y -= randomRange(state.minPlatformGap, state.maxPlatformGap);
  }
}

function createPlatform(yPos) {
  const width = randomRange(70, 115);
  platforms.push({
    x: randomRange(8, canvas.width - width - 8),
    y: yPos,
    width,
    height: 14,
  });
}

function randomRange(min, max) {
  return Math.random() * (max - min) + min;
}

function handleInput() {
  player.vx = 0;
  if (state.keys.left) player.vx = -state.moveSpeed;
  if (state.keys.right) player.vx = state.moveSpeed;
}

function update() {
  if (state.gameOver) return;

  handleInput();

  player.x += player.vx;
  player.vy += state.gravity;
  player.y += player.vy;

  // Horizontal wrap-around, similar to Doodle Jump behavior.
  if (player.x + player.width < 0) player.x = canvas.width;
  if (player.x > canvas.width) player.x = -player.width;

  // Landing detection.
  if (player.vy > 0) {
    for (const platform of platforms) {
      const landingOnX = player.x + player.width > platform.x && player.x < platform.x + platform.width;
      const hittingTop = player.y + player.height >= platform.y && player.y + player.height <= platform.y + platform.height + player.vy;

      if (landingOnX && hittingTop) {
        player.vy = state.jumpVelocity;
        break;
      }
    }
  }

  // Scroll world downward when player is high on screen.
  if (player.y < state.scrollingThreshold && player.vy < 0) {
    const dy = -player.vy;
    player.y += dy;

    for (const platform of platforms) {
      platform.y += dy;
    }

    state.score += Math.floor(dy);
    scoreEl.textContent = String(state.score);
  }

  // Recycle platforms and keep a steady count.
  for (const platform of platforms) {
    if (platform.y > canvas.height + 30) {
      platform.y = -20;
      platform.x = randomRange(8, canvas.width - platform.width - 8);
      platform.width = randomRange(70, 115);
    }
  }

  // Lose condition.
  if (player.y > canvas.height + 80) {
    state.gameOver = true;
    restartBtn.hidden = false;
  }
}

function drawRoundedRect(x, y, width, height, radius, fillStyle) {
  ctx.fillStyle = fillStyle;
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  ctx.fill();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Clouds
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  for (let i = 0; i < 7; i += 1) {
    const x = (i * 77 + state.score * 0.2) % (canvas.width + 100) - 50;
    const y = ((i * 83) % canvas.height) - 30;
    ctx.beginPath();
    ctx.ellipse(x, y, 30, 15, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  for (const platform of platforms) {
    drawRoundedRect(platform.x, platform.y, platform.width, platform.height, 4, '#34c87e');
    drawRoundedRect(platform.x + 4, platform.y + 3, platform.width - 8, 4, 2, '#a5ffca');
  }

  drawRoundedRect(player.x, player.y, player.width, player.height, 8, '#4a54ff');
  drawRoundedRect(player.x + 8, player.y + 10, 8, 8, 3, '#fff');
  drawRoundedRect(player.x + 20, player.y + 10, 8, 8, 3, '#fff');

  if (state.gameOver) {
    ctx.fillStyle = 'rgba(16,20,38,0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 38px Segoe UI';
    ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2 - 20);
    ctx.font = '24px Segoe UI';
    ctx.fillText(`Score: ${state.score}`, canvas.width / 2, canvas.height / 2 + 24);
  }
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

window.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a') state.keys.left = true;
  if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'd') state.keys.right = true;
});

window.addEventListener('keyup', (event) => {
  if (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a') state.keys.left = false;
  if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'd') state.keys.right = false;
});

restartBtn.addEventListener('click', resetGame);

resetGame();
loop();

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const statusEl = document.getElementById("status");
const restartBtn = document.getElementById("restart");

const gravity = 0.32;
const jumpVelocity = -9.2;
const platformCount = 9;
const player = {
  x: canvas.width / 2,
  y: canvas.height - 80,
  width: 24,
  height: 24,
  vx: 0,
  vy: jumpVelocity,
};

let platforms = [];
let keys = { left: false, right: false };
let bestHeight = 0;
let score = 0;
let gameOver = false;

function resetGame() {
  player.x = canvas.width / 2;
  player.y = canvas.height - 80;
  player.vx = 0;
  player.vy = jumpVelocity;
  bestHeight = 0;
  score = 0;
  gameOver = false;
  statusEl.textContent = "";

  platforms = Array.from({ length: platformCount }, (_, i) => {
    const spacing = canvas.height / platformCount;
    return {
      x: Math.random() * (canvas.width - 68),
      y: canvas.height - i * spacing,
      width: 68,
      height: 12,
    };
  });
  platforms[0].x = canvas.width / 2 - 34;
}

function update() {
  if (gameOver) return;

  const move = (keys.right ? 1 : 0) - (keys.left ? 1 : 0);
  player.vx = move * 4;
  player.x += player.vx;

  if (player.x > canvas.width) player.x = -player.width;
  if (player.x + player.width < 0) player.x = canvas.width;

  player.vy += gravity;
  player.y += player.vy;

  for (const platform of platforms) {
    const onTop =
      player.vy > 0 &&
      player.x + player.width > platform.x &&
      player.x < platform.x + platform.width &&
      player.y + player.height >= platform.y &&
      player.y + player.height <= platform.y + platform.height + player.vy;

    if (onTop) {
      player.vy = jumpVelocity;
      break;
    }
  }

  if (player.y < canvas.height * 0.35 && player.vy < 0) {
    const offset = -player.vy;
    player.y += offset;
    bestHeight += offset;
    platforms.forEach((platform) => {
      platform.y += offset;
      if (platform.y > canvas.height) {
        platform.y = -10;
        platform.x = Math.random() * (canvas.width - platform.width);
      }
    });
  }

  score = Math.max(score, Math.floor(bestHeight / 10));
  scoreEl.textContent = score;

  if (player.y > canvas.height + 10) {
    gameOver = true;
    statusEl.textContent = `Game over! Final score: ${score}`;
  }
}

function drawClouds() {
  ctx.fillStyle = "rgba(255,255,255,0.35)";
  for (let i = 0; i < 4; i += 1) {
    const x = (i * 95 + (bestHeight * 0.4) % 420) - 60;
    const y = 60 + i * 100;
    ctx.beginPath();
    ctx.ellipse(x, y, 34, 13, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawClouds();

  ctx.fillStyle = "#1a6f42";
  platforms.forEach((platform) => {
    ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
    ctx.fillStyle = "#89f2bb";
    ctx.fillRect(platform.x, platform.y, platform.width, 3);
    ctx.fillStyle = "#1a6f42";
  });

  ctx.fillStyle = "#ffe655";
  ctx.fillRect(player.x, player.y, player.width, player.height);
  ctx.fillStyle = "#1a1a1a";
  ctx.fillRect(player.x + 5, player.y + 7, 4, 4);
  ctx.fillRect(player.x + 15, player.y + 7, 4, 4);
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

window.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") keys.left = true;
  if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") keys.right = true;
  if (gameOver && event.key === " ") resetGame();
});

window.addEventListener("keyup", (event) => {
  if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") keys.left = false;
  if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") keys.right = false;
});

restartBtn.addEventListener("click", resetGame);

resetGame();
loop();

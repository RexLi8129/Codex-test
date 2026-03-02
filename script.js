const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const restartBtn = document.getElementById("restart");

const game = {
  width: canvas.width,
  height: canvas.height,
  gravity: 0.35,
  jumpVelocity: -10,
  moveSpeed: 4.2,
  platformCount: 10,
  state: "running",
  score: 0,
  cameraY: 0,
};

const player = {
  width: 34,
  height: 34,
  x: game.width / 2 - 17,
  y: game.height - 70,
  vx: 0,
  vy: 0,
  color: "#16a34a",
};

const keys = {
  left: false,
  right: false,
};

const platforms = [];

function random(min, max) {
  return Math.random() * (max - min) + min;
}

function buildPlatforms() {
  platforms.length = 0;
  const spacing = game.height / game.platformCount;

  for (let i = 0; i < game.platformCount; i += 1) {
    platforms.push({
      x: random(20, game.width - 90),
      y: game.height - i * spacing,
      width: random(65, 90),
      height: 12,
      color: "#1d4ed8",
    });
  }

  platforms[0].x = game.width / 2 - 45;
  platforms[0].y = game.height - 40;
  platforms[0].width = 90;
}

function resetGame() {
  game.state = "running";
  game.score = 0;
  game.cameraY = 0;

  player.x = game.width / 2 - player.width / 2;
  player.y = game.height - 80;
  player.vx = 0;
  player.vy = game.jumpVelocity;

  buildPlatforms();
  scoreEl.textContent = "0";
}

function handleInput() {
  if (keys.left) {
    player.vx = -game.moveSpeed;
  } else if (keys.right) {
    player.vx = game.moveSpeed;
  } else {
    player.vx *= 0.85;
  }
}

function recyclePlatform(platform) {
  const highestY = Math.min(...platforms.map((p) => p.y));
  platform.y = highestY - random(50, 85);
  platform.x = random(12, game.width - platform.width - 12);
  platform.width = random(60, 95);
}

function update() {
  if (game.state !== "running") {
    return;
  }

  handleInput();

  player.x += player.vx;
  player.vy += game.gravity;
  player.y += player.vy;

  if (player.x + player.width < 0) player.x = game.width;
  if (player.x > game.width) player.x = -player.width;

  if (player.vy > 0) {
    for (const platform of platforms) {
      const hitTop = player.y + player.height >= platform.y;
      const hitBottom = player.y + player.height <= platform.y + platform.height + player.vy;
      const hitX = player.x + player.width > platform.x && player.x < platform.x + platform.width;

      if (hitTop && hitBottom && hitX) {
        player.vy = game.jumpVelocity;
        break;
      }
    }
  }

  if (player.y < game.height * 0.35) {
    const dy = game.height * 0.35 - player.y;
    player.y = game.height * 0.35;

    for (const platform of platforms) {
      platform.y += dy;
      if (platform.y > game.height) {
        recyclePlatform(platform);
      }
    }

    game.cameraY += dy;
    game.score = Math.max(game.score, Math.floor(game.cameraY));
    scoreEl.textContent = game.score.toString();
  }

  if (player.y > game.height + 40) {
    game.state = "gameover";
  }
}

function drawPlayer() {
  ctx.fillStyle = player.color;
  ctx.fillRect(player.x, player.y, player.width, player.height);

  ctx.fillStyle = "#14532d";
  ctx.fillRect(player.x + 6, player.y + 8, 6, 6);
  ctx.fillRect(player.x + 22, player.y + 8, 6, 6);
}

function drawPlatforms() {
  for (const platform of platforms) {
    ctx.fillStyle = platform.color;
    ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
  }
}

function drawGameOver() {
  if (game.state !== "gameover") {
    return;
  }

  ctx.fillStyle = "rgb(2 6 23 / 68%)";
  ctx.fillRect(0, 0, game.width, game.height);

  ctx.fillStyle = "#f8fafc";
  ctx.textAlign = "center";
  ctx.font = "700 36px Inter, sans-serif";
  ctx.fillText("Game Over", game.width / 2, game.height / 2 - 10);
  ctx.font = "600 18px Inter, sans-serif";
  ctx.fillText("Press Restart to try again", game.width / 2, game.height / 2 + 28);
}

function draw() {
  ctx.clearRect(0, 0, game.width, game.height);
  drawPlatforms();
  drawPlayer();
  drawGameOver();
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

window.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") {
    keys.left = true;
  }
  if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") {
    keys.right = true;
  }
});

window.addEventListener("keyup", (event) => {
  if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") {
    keys.left = false;
  }
  if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") {
    keys.right = false;
  }
});

restartBtn.addEventListener("click", resetGame);

resetGame();
loop();


const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const W = canvas.width;
const H = canvas.height;

const playerScoreEl = document.getElementById("playerScore");
const computerScoreEl = document.getElementById("computerScore");
const timerEl = document.getElementById("timer");
const overlay = document.getElementById("overlay");
const overlayTitle = document.getElementById("overlayTitle");
const overlayText = document.getElementById("overlayText");

const keys = {};
let running = false;
let playerScore = 0;
let computerScore = 0;
let timeLeft = 60;
let lastTime = 0;
let elapsed = 0;
let message = "";
let messageTimer = 0;

const player = {
  x: 150, y: H / 2, r: 17,
  speed: 245, color: "#3195ff",
  vx: 0, vy: 0
};

const ball = {
  x: W / 2, y: H / 2, r: 9,
  vx: 0, vy: 0
};

const goalie = {
  x: W - 52, y: H / 2, r: 22,
  speed: 175
};

const goal = {
  top: H / 2 - 85,
  bottom: H / 2 + 85,
  left: W - 12,
  right: W
};

function resetPositions() {
  player.x = 150;
  player.y = H / 2;
  player.vx = player.vy = 0;

  ball.x = W / 2;
  ball.y = H / 2;
  ball.vx = ball.vy = 0;

  goalie.y = H / 2;
}

function startGame() {
  playerScore = 0;
  computerScore = 0;
  timeLeft = 60;
  elapsed = 0;
  message = "";
  messageTimer = 0;
  playerScoreEl.textContent = 0;
  computerScoreEl.textContent = 0;
  timerEl.textContent = 60;

  resetPositions();
  running = true;
  lastTime = performance.now();
  overlay.classList.add("hidden");
}

function endGame() {
  running = false;
  overlay.classList.remove("hidden");
  overlayTitle.textContent =
    playerScore > computerScore ? "🏆 You Win!" :
    playerScore < computerScore ? "😅 CPU Wins!" : "🤝 It's a Draw!";

  overlayText.textContent =
    `Final score: ${playerScore} - ${computerScore}. Play again?`;

  document.getElementById("startBtn").textContent = "Play Again";
  draw();
}

function scoreGoal(scoringPlayer) {
  if (scoringPlayer === "player") {
    playerScore++;
    playerScoreEl.textContent = playerScore;
    message = "GOAL! ⚽";
  } else {
    computerScore++;
    computerScoreEl.textContent = computerScore;
    message = "CPU SCORES!";
  }

  messageTimer = 1.1;
  resetPositions();
}

function drawField() {
  // Alternating grass stripes
  const stripeWidth = W / 10;
  for (let i = 0; i < 10; i++) {
    ctx.fillStyle = i % 2 === 0 ? "#188b4f" : "#147d47";
    ctx.fillRect(i * stripeWidth, 0, stripeWidth, H);
  }

  ctx.strokeStyle = "rgba(255,255,255,0.85)";
  ctx.lineWidth = 3;
  ctx.strokeRect(25, 25, W - 50, H - 50);

  // Halfway line
  ctx.beginPath();
  ctx.moveTo(W / 2, 25);
  ctx.lineTo(W / 2, H - 25);
  ctx.stroke();

  // Center circle
  ctx.beginPath();
  ctx.arc(W / 2, H / 2, 67, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(W / 2, H / 2, 4, 0, Math.PI * 2);
  ctx.fillStyle = "white";
  ctx.fill();

  // Penalty areas
  ctx.strokeRect(25, H / 2 - 125, 110, 250);
  ctx.strokeRect(W - 135, H / 2 - 125, 110, 250);

  // Goal areas
  ctx.strokeRect(25, H / 2 - 65, 40, 130);
  ctx.strokeRect(W - 65, H / 2 - 65, 40, 130);

  // Goal opening
  ctx.fillStyle = "#d9f5e6";
  ctx.fillRect(W - 10, goal.top, 15, goal.bottom - goal.top);
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 4;
  ctx.strokeRect(W - 12, goal.top, 20, goal.bottom - goal.top);
}

function drawPlayer(p, color, number) {
  ctx.save();
  ctx.shadowColor = "#0005";
  ctx.shadowBlur = 8;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = "white";
  ctx.font = "bold 13px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(number, p.x, p.y);
  ctx.restore();
}

function drawBall() {
  ctx.save();
  ctx.shadowColor = "#0007";
  ctx.shadowBlur = 5;
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.strokeStyle = "#1f2937";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Football pattern
  ctx.fillStyle = "#202b3c";
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function draw() {
  drawField();

  // Player and goalkeeper
  drawPlayer(player, player.color, "10");
  drawPlayer(goalie, "#f04444", "GK");

  // Ball
  drawBall();

  if (messageTimer > 0) {
    ctx.save();
    ctx.textAlign = "center";
    ctx.font = "bold 34px Arial";
    ctx.lineWidth = 5;
    ctx.strokeStyle = "#07351f";
    ctx.strokeText(message, W / 2, 82);
    ctx.fillStyle = "#ffffff";
    ctx.fillText(message, W / 2, 82);
    ctx.restore();
  }
}

function movePlayer(dt) {
  let dx = 0;
  let dy = 0;

  if (keys.ArrowLeft || keys.a) dx--;
  if (keys.ArrowRight || keys.d) dx++;
  if (keys.ArrowUp || keys.w) dy--;
  if (keys.ArrowDown || keys.s) dy++;

  const length = Math.hypot(dx, dy);
  if (length > 0) {
    dx /= length;
    dy /= length;
  }

  player.vx = dx * player.speed;
  player.vy = dy * player.speed;

  player.x += player.vx * dt;
  player.y += player.vy * dt;

  player.x = Math.max(40, Math.min(W - 45, player.x));
  player.y = Math.max(40, Math.min(H - 40, player.y));
}

function moveBall(dt) {
  ball.x += ball.vx * dt;
  ball.y += ball.vy * dt;

  // Friction
  const friction = Math.pow(0.985, dt * 60);
  ball.vx *= friction;
  ball.vy *= friction;

  if (Math.abs(ball.vx) < 3) ball.vx = 0;
  if (Math.abs(ball.vy) < 3) ball.vy = 0;

  // Top and bottom walls
  if (ball.y - ball.r < 28) {
    ball.y = 28 + ball.r;
    ball.vy = Math.abs(ball.vy) * 0.75;
  }

  if (ball.y + ball.r > H - 28) {
    ball.y = H - 28 - ball.r;
    ball.vy = -Math.abs(ball.vy) * 0.75;
  }

  // Left wall
  if (ball.x - ball.r < 28) {
    ball.x = 28 + ball.r;
    ball.vx = Math.abs(ball.vx) * 0.75;
  }

  // Right side: goal or wall
  if (ball.x + ball.r >= W - 8) {
    if (ball.y > goal.top && ball.y < goal.bottom) {
      scoreGoal("player");
      return;
    } else {
      ball.x = W - 8 - ball.r;
      ball.vx = -Math.abs(ball.vx) * 0.75;
    }
  }
}

function moveGoalkeeper(dt) {
  // Follow the ball, but stay inside the goal
  const targetY = Math.max(
    goal.top + goalie.r,
    Math.min(goal.bottom - goalie.r, ball.y)
  );

  const difference = targetY - goalie.y;
  const maxMove = goalie.speed * dt;

  goalie.y += Math.sign(difference) *
    Math.min(Math.abs(difference), maxMove);

  // Block a moving ball
  const dx = ball.x - goalie.x;
  const dy = ball.y - goalie.y;
  const distance = Math.hypot(dx, dy);
  const reach = ball.r + goalie.r;

  if (distance < reach && ball.vx > 0) {
    ball.x = goalie.x - reach - 1;
    ball.vx = -Math.max(240, Math.abs(ball.vx) * 0.9);
    ball.vy += dy * 4;
  }
}

function handlePlayerBallCollision() {
  const dx = ball.x - player.x;
  const dy = ball.y - player.y;
  const distance = Math.hypot(dx, dy);
  const minDistance = ball.r + player.r;

  if (distance < minDistance) {
    const nx = distance > 0 ? dx / distance : 1;
    const ny = distance > 0 ? dy / distance : 0;

    ball.x = player.x + nx * minDistance;
    ball.y = player.y + ny * minDistance;

    // Moving into the ball gives it a gentle push
    const approach = player.vx * nx + player.vy * ny;
    if (approach > 0) {
      ball.vx += nx * approach * 0.8;
      ball.vy += ny * approach * 0.8;
    }
  }
}

function kickBall() {
  if (!running) return;

  const dx = ball.x - player.x;
  const dy = ball.y - player.y;
  const distance = Math.hypot(dx, dy);

  if (distance < 65) {
    // Kick mostly toward the opponent's goal
    const aimX = W - ball.x;
    const aimY = H / 2 - ball.y;
    const aimLength = Math.hypot(aimX, aimY) || 1;

    ball.vx = (aimX / aimLength) * 560;
    ball.vy = (aimY / aimLength) * 250 +
      player.vy * 0.3;

    // Keep the kick powerful
    ball.vx = Math.max(380, ball.vx);
  }
}

function update(dt) {
  if (!running) return;

  elapsed += dt;
  timeLeft = Math.max(0, 60 - Math.floor(elapsed));
  timerEl.textContent = timeLeft;

  if (messageTimer > 0) messageTimer -= dt;

  movePlayer(dt);
  handlePlayerBallCollision();
  moveGoalkeeper(dt);
  moveBall(dt);
  handlePlayerBallCollision();

  if (timeLeft <= 0) {
    endGame();
  }
}

function gameLoop(timestamp) {
  const dt = Math.min((timestamp - lastTime) / 1000, 0.04);
  lastTime = timestamp;

  update(dt);
  draw();

  requestAnimationFrame(gameLoop);
}

document.addEventListener("keydown", (event) => {
  const key = event.key.length === 1
    ? event.key.toLowerCase()
    : event.key;

  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "]
      .includes(event.key)) {
    event.preventDefault();
  }

  keys[key] = true;

  if (event.code === "Space" && !event.repeat) {
    kickBall();
  }
});

document.addEventListener("keyup", (event) => {
  const key = event.key.length === 1
    ? event.key.toLowerCase()
    : event.key;

  keys[key] = false;
});

document.getElementById("startBtn").addEventListener("click", startGame);
document.getElementById("restartBtn").addEventListener("click", startGame);
document.getElementById("kickBtn").addEventListener("click", kickBall);

// Mobile directional controls
document.querySelectorAll("[data-key]").forEach((button) => {
  const key = button.dataset.key;

  const release = (event) => {
    event.preventDefault();
    keys[key] = false;
  };

  button.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    keys[key] = true;
  });

  button.addEventListener("pointerup", release);
  button.addEventListener("pointercancel", release);
  button.addEventListener("lostpointercapture", release);
  button.addEventListener("pointerleave", release);
});

draw();
requestAnimationFrame((timestamp) => {
  lastTime = timestamp;
  gameLoop(timestamp);
});

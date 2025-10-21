// Simple Pong game
// Controls: mousemove or ArrowUp / ArrowDown to move left paddle
// Click the canvas to (re)start

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const W = canvas.width;
const H = canvas.height;

// Game objects
const paddleWidth = 12;
const paddleHeight = 110;

const player = {
  x: 10,
  y: (H - paddleHeight) / 2,
  width: paddleWidth,
  height: paddleHeight,
  speed: 7,
  score: 0
};

const computer = {
  x: W - paddleWidth - 10,
  y: (H - paddleHeight) / 2,
  width: paddleWidth,
  height: paddleHeight,
  speed: 5,
  score: 0
};

const ball = {
  x: W / 2,
  y: H / 2,
  r: 8,
  speed: 6,
  vx: 0,
  vy: 0
};

let running = false;
let lastTime = 0;
let keys = { up: false, down: false };

// DOM scoreboard
const playerScoreEl = document.getElementById('playerScore');
const computerScoreEl = document.getElementById('computerScore');

// Utility
function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
function randRange(a,b){ return a + Math.random()*(b-a); }

function resetBall(winner){
  ball.x = W/2;
  ball.y = H/2;
  ball.speed = 6;
  // serve toward the player who lost (so winner receives the serve)
  const dir = winner === 'player' ? -1 : 1;
  const angle = randRange(-Math.PI/4, Math.PI/4);
  ball.vx = dir * ball.speed * Math.cos(angle);
  ball.vy = ball.speed * Math.sin(angle);
  running = false;
  // brief pause before restarting
  setTimeout(()=> running = true, 600);
}

function startGame(){
  player.score = 0;
  computer.score = 0;
  updateScoreDOM();
  resetBall(null);
  running = true;
}

function updateScoreDOM(){
  playerScoreEl.textContent = player.score;
  computerScoreEl.textContent = computer.score;
}

// Initialize first serve
resetBall(null);

// Input - mouse
canvas.addEventListener('mousemove', (e)=>{
  const rect = canvas.getBoundingClientRect();
  const mouseY = e.clientY - rect.top;
  player.y = clamp(mouseY - player.height/2, 0, H - player.height);
});

// Keyboard
window.addEventListener('keydown', (e)=>{
  if(e.key === 'ArrowUp') keys.up = true;
  if(e.key === 'ArrowDown') keys.down = true;
});
window.addEventListener('keyup', (e)=>{
  if(e.key === 'ArrowUp') keys.up = false;
  if(e.key === 'ArrowDown') keys.down = false;
});

// Click canvas to start/restart
canvas.addEventListener('click', ()=>{
  if(!running){
    // If scores are zero, start fresh; otherwise keep scores and serve
    resetBall(null);
  }
  running = true;
});

// Collision detection between ball and rectangle paddle
function intersectsBallRect(bx, by, br, rx, ry, rw, rh){
  // Closest point on rectangle to circle center
  const closestX = clamp(bx, rx, rx + rw);
  const closestY = clamp(by, ry, ry + rh);
  const dx = bx - closestX;
  const dy = by - closestY;
  return (dx*dx + dy*dy) <= (br*br);
}

function update(dt){
  if(!running) return;

  // Player keyboard movement
  if(keys.up) player.y -= player.speed;
  if(keys.down) player.y += player.speed;
  player.y = clamp(player.y, 0, H - player.height);

  // Computer AI: follow ball with limited speed, add small deadzone
  const targetY = ball.y - computer.height/2;
  const diff = targetY - computer.y;
  const followSpeed = computer.speed + Math.min(0.01*ball.speed, 2);
  if(Math.abs(diff) > 4){
    computer.y += Math.sign(diff) * Math.min(followSpeed, Math.abs(diff));
  }
  computer.y = clamp(computer.y, 0, H - computer.height);

  // Move ball
  ball.x += ball.vx;
  ball.y += ball.vy;

  // Wall collisions
  if(ball.y - ball.r <= 0){
    ball.y = ball.r;
    ball.vy *= -1;
  } else if(ball.y + ball.r >= H){
    ball.y = H - ball.r;
    ball.vy *= -1;
  }

  // Paddle collisions
  // Left paddle (player)
  if(intersectsBallRect(ball.x, ball.y, ball.r, player.x, player.y, player.width, player.height) && ball.vx < 0){
    // compute collision point to vary angle
    const collidePoint = (ball.y - (player.y + player.height/2));
    const normalized = collidePoint / (player.height/2);
    const maxBounce = Math.PI/3; // 60 degrees
    const bounceAngle = normalized * maxBounce;
    ball.speed = Math.min(12, ball.speed + 0.25);
    ball.vx = Math.abs(ball.speed * Math.cos(bounceAngle));
    ball.vy = ball.speed * Math.sin(bounceAngle);
    // push ball outside paddle
    ball.x = player.x + player.width + ball.r + 0.1;
  }

  // Right paddle (computer)
  if(intersectsBallRect(ball.x, ball.y, ball.r, computer.x, computer.y, computer.width, computer.height) && ball.vx > 0){
    const collidePoint = (ball.y - (computer.y + computer.height/2));
    const normalized = collidePoint / (computer.height/2);
    const maxBounce = Math.PI/3;
    const bounceAngle = normalized * maxBounce;
    ball.speed = Math.min(12, ball.speed + 0.25);
    ball.vx = -Math.abs(ball.speed * Math.cos(bounceAngle));
    ball.vy = ball.speed * Math.sin(bounceAngle);
    ball.x = computer.x - ball.r - 0.1;
  }

  // Scoring
  if(ball.x - ball.r <= 0){
    // computer scores
    computer.score += 1;
    updateScoreDOM();
    resetBall('computer');
  } else if(ball.x + ball.r >= W){
    // player scores
    player.score += 1;
    updateScoreDOM();
    resetBall('player');
  }
}

function drawNet(){
  ctx.save();
  ctx.fillStyle = 'rgba(155,231,255,0.12)';
  const segment = 12;
  for(let y=0; y<H; y+=segment*1.8){
    ctx.fillRect(W/2 - 1, y, 2, segment);
  }
  ctx.restore();
}

function draw(){
  // background
  ctx.clearRect(0,0,W,H);
  // subtle inner glow
  ctx.fillStyle = 'rgba(0,0,0,0.06)';
  ctx.fillRect(0,0,W,H);

  // net
  drawNet();

  // paddles
  ctx.fillStyle = '#9be7ff';
  roundRect(ctx, player.x, player.y, player.width, player.height, 4, true, false);
  roundRect(ctx, computer.x, computer.y, computer.width, computer.height, 4, true, false);

  // ball
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI*2);
  ctx.fill();

  // small glow around ball
  const g = ctx.createRadialGradient(ball.x, ball.y, ball.r*0.2, ball.x, ball.y, ball.r*6);
  g.addColorStop(0, 'rgba(155,231,255,0.18)');
  g.addColorStop(1, 'rgba(155,231,255,0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.r*6, 0, Math.PI*2);
  ctx.fill();
}

// helper to draw rounded rect
function roundRect(ctx, x, y, w, h, r, fill=true, stroke=false){
  ctx.beginPath();
  ctx.moveTo(x+r, y);
  ctx.arcTo(x+w, y, x+w, y+h, r);
  ctx.arcTo(x+w, y+h, x, y+h, r);
  ctx.arcTo(x, y+h, x, y, r);
  ctx.arcTo(x, y, x+w, y, r);
  ctx.closePath();
  if(fill){ ctx.fill(); }
  if(stroke){ ctx.stroke(); }
}

function loop(timestamp){
  const dt = timestamp - lastTime;
  lastTime = timestamp;
  update(dt);
  draw();
  requestAnimationFrame(loop);
}

// start animation loop
requestAnimationFrame(loop);

// Expose start to console if needed
window.pongStart = startGame;
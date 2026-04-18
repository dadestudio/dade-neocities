export function initSnake(canvas) {
  var ctx = canvas.getContext('2d');
  var GW = 20;
  var GH = 20;
  var snake;
  var dir;
  var nextDir;
  var food;
  var alive;
  var score;
  var acc = 0;
  var last = performance.now();
  var stepMs = 95;
  var keys = {};

  function cell() {
    var cw = canvas.width;
    var ch = canvas.height;
    return Math.floor(Math.min(cw, ch) / GW);
  }

  function foodOk(x, y) {
    for (var i = 0; i < snake.length; i++) {
      if (snake[i].x === x && snake[i].y === y) return 0;
    }
    return 1;
  }

  function randFood() {
    var x;
    var y;
    do {
      x = (Math.random() * GW) | 0;
      y = (Math.random() * GH) | 0;
    } while (!foodOk(x, y));
    food = { x: x, y: y };
  }

  function reset() {
    snake = [
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 },
    ];
    dir = { x: 1, y: 0 };
    nextDir = { x: 1, y: 0 };
    alive = 1;
    score = 0;
    acc = 0;
    randFood();
  }

  function die() {
    alive = 0;
  }

  function pollDir() {
    if (keys.ArrowUp && dir.y === 0) nextDir = { x: 0, y: -1 };
    if (keys.ArrowDown && dir.y === 0) nextDir = { x: 0, y: 1 };
    if (keys.ArrowLeft && dir.x === 0) nextDir = { x: -1, y: 0 };
    if (keys.ArrowRight && dir.x === 0) nextDir = { x: 1, y: 0 };
  }

  function step() {
    if (!alive) return;
    dir = nextDir;
    var h = snake[0];
    var nx = h.x + dir.x;
    var ny = h.y + dir.y;
    if (nx < 0 || ny < 0 || nx >= GW || ny >= GH) {
      die();
      return;
    }
    for (var j = 0; j < snake.length; j++) {
      if (snake[j].x === nx && snake[j].y === ny) {
        die();
        return;
      }
    }
    snake.unshift({ x: nx, y: ny });
    if (nx === food.x && ny === food.y) {
      score++;
      try {
        var hi = +localStorage.getItem('snake_high') || 0;
        if (score > hi) localStorage.setItem('snake_high', String(score));
      } catch (e) {}
      randFood();
    } else {
      snake.pop();
    }
  }

  function draw(gs, ox, oy) {
    ctx.fillStyle = '#102040';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(ox, oy);
    ctx.fillStyle = '#00ff66';
    for (var i = 0; i < snake.length; i++) {
      ctx.fillRect(snake[i].x * gs + 1, snake[i].y * gs + 1, gs - 2, gs - 2);
    }
    ctx.fillStyle = '#ff4444';
    ctx.fillRect(food.x * gs + 1, food.y * gs + 1, gs - 2, gs - 2);
    if (!alive) {
      ctx.fillStyle = '#ffff00';
      ctx.font = 'bold 14px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('GAME OVER — SPACE', (GW * gs) / 2, (GH * gs) / 2);
    }
    ctx.restore();
  }

  function loop(t) {
    requestAnimationFrame(loop);
    var dt = t - last;
    last = t;
    acc += dt;
    pollDir();
    while (acc >= stepMs) {
      acc -= stepMs;
      step();
    }
    var gs = cell();
    var ox = (canvas.width - gs * GW) >> 1;
    var oy = (canvas.height - gs * GH) >> 1;
    draw(gs, ox, oy);
  }

  window.addEventListener('keydown', function (e) {
    if (e.key.startsWith('Arrow')) keys[e.key] = 1;
    if (!alive && e.code === 'Space') {
      e.preventDefault();
      reset();
    }
  });
  window.addEventListener('keyup', function (e) {
    if (e.key.startsWith('Arrow')) keys[e.key] = 0;
  });

  reset();
  requestAnimationFrame(loop);
}

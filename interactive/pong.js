export function initPong(canvas) {
  var ctx = canvas.getContext('2d');
  var w;
  var h;
  var py;
  var aiY;
  var bx;
  var by;
  var bvx;
  var bvy;
  var pScore;
  var aScore;
  var playing;
  var done;
  var keys = {};
  var pw = 8;
  var ph = 56;
  var last = performance.now();

  function resetBall() {
    bx = w * 0.5;
    by = h * 0.5;
    bvx = (Math.random() > 0.5 ? 1 : -1) * (2.8 + Math.random() * 0.6);
    bvy = (Math.random() * 2 - 1) * 2.2;
  }

  function newMatch() {
    w = canvas.width;
    h = canvas.height;
    py = h * 0.5 - ph * 0.5;
    aiY = py;
    pScore = 0;
    aScore = 0;
    playing = 1;
    done = 0;
    resetBall();
  }

  function saveHi() {
    try {
      var hi = +localStorage.getItem('pong_high') || 0;
      if (pScore > hi) localStorage.setItem('pong_high', String(pScore));
    } catch (e) {}
  }

  function endMatch() {
    playing = 0;
    done = 1;
    saveHi();
  }

  function update(dt) {
    if (!playing) return;
    var spd = 0.32 * dt;
    if (keys.KeyW) py -= spd;
    if (keys.KeyS) py += spd;
    py = Math.max(0, Math.min(h - ph, py));
    var aim = by - ph * 0.5;
    aiY += Math.max(-spd * 0.85, Math.min(spd * 0.85, aim - aiY));
    aiY = Math.max(0, Math.min(h - ph, aiY));
    bx += bvx * dt * 0.06;
    by += bvy * dt * 0.06;
    if (by < 8 || by > h - 8) bvy *= -1;
    var lx = pw + 4;
    var rx = w - pw - 4;
    if (bx < lx + 6 && by > py && by < py + ph && bvx < 0) {
      bx = lx + 6;
      bvx *= -1.05;
      bvy += (by - (py + ph * 0.5)) * 0.04;
    }
    if (bx > rx - 6 && by > aiY && by < aiY + ph && bvx > 0) {
      bx = rx - 6;
      bvx *= -1.05;
      bvy += (by - (aiY + ph * 0.5)) * 0.04;
    }
    if (bx < 0) {
      aScore++;
      if (aScore >= 5) endMatch();
      else resetBall();
    } else if (bx > w) {
      pScore++;
      if (pScore >= 5) endMatch();
      else resetBall();
    }
  }

  function draw() {
    ctx.fillStyle = '#100028';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#444';
    ctx.setLineDash([6, 8]);
    ctx.beginPath();
    ctx.moveTo(w * 0.5, 0);
    ctx.lineTo(w * 0.5, h);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#00ffaa';
    ctx.fillRect(pw, py, pw, ph);
    ctx.fillStyle = '#ff66cc';
    ctx.fillRect(w - pw * 2, aiY, pw, ph);
    ctx.fillStyle = '#ffff00';
    ctx.beginPath();
    ctx.arc(bx, by, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 16px monospace';
    ctx.fillText(pScore, w * 0.25, 24);
    ctx.fillText(aScore, w * 0.72, 24);
    if (done) {
      ctx.fillStyle = '#ff0';
      ctx.font = 'bold 14px monospace';
      ctx.textAlign = 'center';
      var msg = pScore >= 5 ? 'YOU WIN — SPACE' : 'CPU WINS — SPACE';
      ctx.fillText(msg, w * 0.5, h * 0.5);
      ctx.textAlign = 'left';
    }
  }

  function loop(t) {
    requestAnimationFrame(loop);
    var dt = Math.min(40, t - last);
    last = t;
    update(dt);
    draw();
  }

  window.addEventListener('keydown', function (e) {
    keys[e.code] = 1;
    if (done && e.code === 'Space') {
      e.preventDefault();
      newMatch();
    }
  });
  window.addEventListener('keyup', function (e) {
    keys[e.code] = 0;
  });

  newMatch();
  requestAnimationFrame(loop);
}

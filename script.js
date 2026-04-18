/* G3: fake hit counter, cursor trail, status scroller — vanilla JS, no deps */
(function () {
  'use strict';

  var STORAGE_KEY = 'dadeHitCount';
  var DOT_COUNT = 5;
  var FADE_MS = 600;
  var STATUS_INTERVAL_MS = 3000;

  function padSix(n) {
    var v = Math.min(Math.max(0, Math.floor(n)), 999999);
    var s = String(v);
    while (s.length < 6) s = '0' + s;
    return s;
  }

  /* 1) Hit counter — index only: #dade-hit-counter wraps fallback <img> */
  var hitEl = document.getElementById('dade-hit-counter');
  if (hitEl) {
    var nextCount = 1;
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      var parsed = parseInt(raw, 10);
      if (Number.isFinite(parsed) && parsed >= 0) nextCount = parsed + 1;
      if (nextCount > 999999) nextCount = 999999;
      localStorage.setItem(STORAGE_KEY, String(nextCount));
    } catch (e) {
      nextCount = 1;
    }
    hitEl.innerHTML =
      '<span class="dade-odometer" title="Visitor count (local demo)">' +
      padSix(nextCount) +
      '</span>';
  }

  /* 3) Status scroller */
  var messages = [
    'Welcome to my homepage!',
    'Sign my guestbook!',
    'Best viewed in 800x600'
  ];
  var statusIndex = 0;
  var statusScrollerEl = document.getElementById('status-scroller');

  function applyStatusMessage() {
    var msg = messages[statusIndex % messages.length];
    statusIndex += 1;
    try {
      window.status = msg;
    } catch (e2) {}
    if (statusScrollerEl) statusScrollerEl.textContent = msg;
  }

  applyStatusMessage();
  window.setInterval(applyStatusMessage, STATUS_INTERVAL_MS);

  /* 2) Cursor trail — rAF loop, coalesced mousemove */
  var x = [];
  var y = [];
  var born = [];
  var i;
  for (i = 0; i < DOT_COUNT; i += 1) {
    x.push(0);
    y.push(0);
    born.push(-1e15);
  }

  var mx = -9999;
  var my = -9999;
  var pendingMove = null;
  var animating = false;
  var trailPrimed = false;
  var dots = [];
  var root = document.createElement('div');
  root.id = 'cursor-trail-root';
  root.setAttribute('aria-hidden', 'true');
  for (i = 0; i < DOT_COUNT; i += 1) {
    var dot = document.createElement('span');
    dot.className =
      'cursor-trail-dot' + (i % 2 === 0 ? ' cursor-trail-dot--a' : ' cursor-trail-dot--b');
    root.appendChild(dot);
    dots.push(dot);
  }
  document.body.appendChild(root);

  function trailStep(now) {
    if (pendingMove) {
      mx = pendingMove.clientX;
      my = pendingMove.clientY;
      pendingMove = null;
      if (!trailPrimed) {
        var stagger = 40;
        for (var p = 0; p < DOT_COUNT; p += 1) {
          x[p] = mx;
          y[p] = my;
          born[p] = now - (DOT_COUNT - 1 - p) * stagger;
        }
        trailPrimed = true;
      } else {
        for (var j = DOT_COUNT - 1; j > 0; j -= 1) {
          x[j] = x[j - 1];
          y[j] = y[j - 1];
          born[j] = born[j - 1];
        }
        x[0] = mx;
        y[0] = my;
        born[0] = now;
      }
    }

    var anyVisible = false;
    for (var k = 0; k < DOT_COUNT; k += 1) {
      var age = now - born[k];
      var op = Math.max(0, 1 - age / FADE_MS);
      if (op > 0.02) anyVisible = true;
      dots[k].style.opacity = String(op);
      dots[k].style.transform =
        'translate(' + x[k] + 'px,' + y[k] + 'px) translate(-50%,-50%)';
    }

    if (anyVisible || pendingMove) {
      requestAnimationFrame(trailStep);
    } else {
      animating = false;
    }
  }

  function onMouseMove(e) {
    pendingMove = e;
    if (!animating) {
      animating = true;
      requestAnimationFrame(trailStep);
    }
  }

  document.addEventListener('mousemove', onMouseMove, { passive: true });
})();

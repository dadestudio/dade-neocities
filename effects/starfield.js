/**
 * Parallax starfield (200 stars, 3 layers). Respects prefers-reduced-motion.
 * Raw Canvas 2D only. Persists visibility in localStorage (stars_enabled).
 */

const STORAGE_KEY = 'stars_enabled';
const LAYER_COLORS = ['#ffffff', '#00ffff', '#ff66ff'];
const LAYER_SPEED = [0.12, 0.28, 0.52];

let canvasRef = null;
let starsEnabled = true;
let rafId = 0;
let stars = [];
let lastW = 0;
let lastH = 0;
let lastFrameMs = 0;
let reduceMotion =
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function readStoredBool(key, defaultTrue) {
  try {
    const v = localStorage.getItem(key);
    if (v === null) return defaultTrue;
    return v !== 'false';
  } catch {
    return defaultTrue;
  }
}

function syncCanvasSize(canvas) {
  const dpr = window.devicePixelRatio || 1;
  const w = window.innerWidth;
  const h = window.innerHeight;
  const nw = Math.max(1, Math.floor(w * dpr));
  const nh = Math.max(1, Math.floor(h * dpr));
  const ctx = canvas.getContext('2d');
  if (canvas.width !== nw || canvas.height !== nh) {
    canvas.width = nw;
    canvas.height = nh;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, w, h };
}

function hexToRgb(hex) {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
}

function buildStars(w, h) {
  const perLayer = [67, 67, 66];
  const list = [];
  for (let layer = 0; layer < 3; layer += 1) {
    for (let i = 0; i < perLayer[layer]; i += 1) {
      list.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 0.35 + Math.random() * (layer === 0 ? 0.9 : 0.75),
        layer,
        phase: Math.random() * Math.PI * 2,
      });
    }
  }
  return list;
}

function drawStars(ctx, w, h, t) {
  ctx.clearRect(0, 0, w, h);
  if (!stars.length) stars = buildStars(w, h);

  for (let i = 0; i < stars.length; i += 1) {
    const s = stars[i];
    const [r, g, b] = hexToRgb(LAYER_COLORS[s.layer]);
    let alpha = 0.55 + 0.35 * Math.sin(t * 0.002 + s.phase);
    if (reduceMotion) alpha = 0.75;

    ctx.beginPath();
    ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fill();
  }
}

function stepStars(w, h, dt) {
  if (reduceMotion) return;
  const scale = Math.min(2.5, Math.max(0, dt / 16.67));
  for (let i = 0; i < stars.length; i += 1) {
    const s = stars[i];
    const sp = LAYER_SPEED[s.layer] * scale;
    s.y += sp;
    s.x += (s.layer - 1) * 0.04 * scale;
    if (s.y > h + 2) s.y -= h + 4;
    if (s.x > w + 2) s.x -= w + 4;
    if (s.x < -2) s.x += w + 4;
  }
}

function tick(now) {
  if (!canvasRef || !starsEnabled) return;

  const { ctx, w, h } = syncCanvasSize(canvasRef);
  if (!stars.length || lastW !== w || lastH !== h) {
    stars = buildStars(w, h);
    lastW = w;
    lastH = h;
  }

  const dt = lastFrameMs ? now - lastFrameMs : 16.67;
  lastFrameMs = now;
  stepStars(w, h, dt);
  drawStars(ctx, w, h, now);

  rafId = requestAnimationFrame(tick);
}

function stopLoop() {
  if (rafId) cancelAnimationFrame(rafId);
  rafId = 0;
  lastFrameMs = 0;
  if (canvasRef) {
    const { ctx, w, h } = syncCanvasSize(canvasRef);
    ctx.clearRect(0, 0, w, h);
  }
}

function startLoop() {
  stopLoop();
  if (!canvasRef || !starsEnabled) return;
  lastFrameMs = 0;
  rafId = requestAnimationFrame(tick);
}

function attachMotionQueryListener() {
  if (typeof window === 'undefined' || !window.matchMedia) return;
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  const onChange = (e) => {
    reduceMotion = e.matches;
    if (!starsEnabled || !canvasRef) return;
    const { ctx, w, h } = syncCanvasSize(canvasRef);
    stars = buildStars(w, h);
    lastW = w;
    lastH = h;
    drawStars(ctx, w, h, performance.now());
  };
  if (mq.addEventListener) mq.addEventListener('change', onChange);
  else if (mq.addListener) mq.addListener(onChange);
}

export function initStarfield({ canvas }) {
  canvasRef = canvas;
  starsEnabled = readStoredBool(STORAGE_KEY, true);
  attachMotionQueryListener();

  const onResize = () => {
    if (!canvasRef || !starsEnabled) return;
    const { w, h } = syncCanvasSize(canvasRef);
    stars = buildStars(w, h);
    lastW = w;
    lastH = h;
  };
  window.addEventListener('resize', onResize);

  if (starsEnabled) startLoop();
  else stopLoop();
}

export function setStarsEnabled(enabled) {
  starsEnabled = !!enabled;
  try {
    localStorage.setItem(STORAGE_KEY, String(starsEnabled));
  } catch {
    /* ignore */
  }
  if (starsEnabled) startLoop();
  else {
    stars = [];
    stopLoop();
  }
}

/**
 * CRT-style overlay: scanlines, subtle RGB split, vignette.
 * Raw Canvas 2D only. Persists state in localStorage (crt_enabled).
 */

const STORAGE_KEY = 'crt_enabled';

let canvasRef = null;
let ctxRef = null;
let crtEnabled = true;
let rafId = 0;

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

function drawCRT(ctx, w, h) {
  ctx.clearRect(0, 0, w, h);

  const cx = w * 0.5;
  const cy = h * 0.5;
  const innerR = Math.min(w, h) * 0.22;
  const outerR = Math.max(w, h) * 0.85;
  const vignette = ctx.createRadialGradient(cx, cy, innerR, cx, cy, outerR);
  vignette.addColorStop(0, 'rgba(0,0,0,0)');
  vignette.addColorStop(0.65, 'rgba(0,0,0,0.12)');
  vignette.addColorStop(1, 'rgba(0,0,0,0.58)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, w, h);

  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  for (let y = 0; y < h; y += 4) {
    ctx.fillStyle = 'rgba(255,0,0,0.07)';
    ctx.fillRect(-1, y, w + 2, 2);
    ctx.fillStyle = 'rgba(0,255,255,0.06)';
    ctx.fillRect(1, y, w + 2, 2);
  }
  ctx.restore();

  for (let y = 0; y < h; y += 4) {
    ctx.fillStyle = 'rgba(0,0,0,0.34)';
    ctx.fillRect(0, y, w, 2);
  }
}

function tick() {
  if (!canvasRef || !crtEnabled) return;

  const { ctx, w, h } = syncCanvasSize(canvasRef);
  ctxRef = ctx;
  drawCRT(ctx, w, h);
  rafId = requestAnimationFrame(tick);
}

function stopLoop() {
  if (rafId) cancelAnimationFrame(rafId);
  rafId = 0;
  if (canvasRef) {
    const { ctx, w, h } = syncCanvasSize(canvasRef);
    ctxRef = ctx;
    ctx.clearRect(0, 0, w, h);
  }
}

function startLoop() {
  stopLoop();
  if (!canvasRef || !crtEnabled) return;
  rafId = requestAnimationFrame(tick);
}

export function initCRT({ canvas, enabled }) {
  canvasRef = canvas;
  crtEnabled = readStoredBool(STORAGE_KEY, true);
  if (typeof enabled === 'boolean') crtEnabled = enabled;

  const onResize = () => {
    if (!canvasRef) return;
    if (crtEnabled) {
      const { ctx, w, h } = syncCanvasSize(canvasRef);
      ctxRef = ctx;
      drawCRT(ctx, w, h);
    }
  };
  window.addEventListener('resize', onResize);

  if (crtEnabled) startLoop();
  else stopLoop();
}

export function setCRTEnabled(enabled) {
  crtEnabled = !!enabled;
  try {
    localStorage.setItem(STORAGE_KEY, String(crtEnabled));
  } catch {
    /* ignore */
  }
  if (crtEnabled) startLoop();
  else stopLoop();
}

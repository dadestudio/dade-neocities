/**
 * Nav hover / click earcons — respects localStorage sfx_enabled (default off).
 * Uses globalThis.__dadeAudioCtx only after user has unlocked audio (PLAY).
 */

const LS_KEY = 'sfx_enabled';

function sfxEnabled() {
  try {
    return localStorage.getItem(LS_KEY) === 'true';
  } catch (_) {
    return false;
  }
}

function getCtxIfUnlocked() {
  return globalThis.__dadeAudioCtx || null;
}

function playOneShot({ type, freq, durMs, gain = 0.12 }) {
  if (!sfxEnabled()) return;
  const ctx = getCtxIfUnlocked();
  if (!ctx || ctx.state !== 'running') return;
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, now);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, now);
  g.gain.exponentialRampToValueAtTime(gain, now + 0.005);
  g.gain.exponentialRampToValueAtTime(0.0001, now + durMs / 1000);
  osc.connect(g);
  g.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + durMs / 1000 + 0.02);
}

export function initSFX() {
  function bindNav() {
    const links = document.querySelectorAll('a.nav-link');
    for (const a of links) {
      a.addEventListener(
        'mouseenter',
        () => {
          playOneShot({ type: 'square', freq: 800, durMs: 60 });
        },
        { passive: true },
      );
      a.addEventListener(
        'click',
        () => {
          playOneShot({ type: 'triangle', freq: 400, durMs: 80 });
        },
        { passive: true },
      );
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindNav);
  } else {
    bindNav();
  }
}

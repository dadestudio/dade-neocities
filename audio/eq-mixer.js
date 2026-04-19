/**
 * T13 — per-GM-family mixer.
 *
 * Splits the master gain into 7 family GainNodes routed in parallel:
 *
 *   instrument -> familyGains[name] -> masterGain -> analyser -> destination
 *
 * The scheduler & analyser chain in player.js are untouched — the mixer is
 * a pure audio-graph fan-in plus localStorage-backed UI state.
 */

export const FAMILY_ORDER = ['guitars', 'strings', 'bass', 'pads', 'leads', 'perc', 'other'];

export const PRESETS = {
  Flat:      [1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00],
  Rock:      [1.20, 1.00, 1.20, 0.70, 1.00, 1.15, 1.00],
  Dance:     [1.00, 1.00, 1.25, 1.00, 1.20, 1.20, 1.00],
  Classical: [0.70, 1.25, 1.00, 1.20, 0.70, 1.00, 1.00],
};

const LS_GAINS = 'mix_gains';
const LS_PRESET = 'mix_preset';
const G_MIN = 0.0;
const G_MAX = 1.5;

function clamp(v) {
  v = Number(v);
  if (!isFinite(v)) return 1.0;
  return Math.max(G_MIN, Math.min(G_MAX, v));
}

// GM program number (0-127) → family. Drums always go to 'perc' regardless
// of program number (channel-9 percussion has no Program Change semantics).
export function familyForProgram(programNumber, isDrum) {
  if (isDrum) return 'perc';
  const p = (programNumber | 0);
  if (p >= 24 && p <= 31) return 'guitars';
  if (p >= 32 && p <= 39) return 'bass';
  if (p >= 40 && p <= 55) return 'strings';
  if (p >= 80 && p <= 87) return 'leads';
  if (p >= 88 && p <= 95) return 'pads';
  if (p >= 112 && p <= 119) return 'perc';
  return 'other';
}

export function createMixer(ctx, masterGain) {
  const familyGains = new Map();
  for (const name of FAMILY_ORDER) {
    const g = ctx.createGain();
    g.gain.value = 1.0;
    g.connect(masterGain);
    familyGains.set(name, g);
  }

  let lastPreset = 'Flat';

  function setFamilyGain(name, linear) {
    const g = familyGains.get(name);
    if (!g) return;
    g.gain.value = clamp(linear);
  }

  function getGains() {
    return FAMILY_ORDER.map((n) => familyGains.get(n).gain.value);
  }

  function applyPreset(name) {
    const arr = PRESETS[name];
    if (!arr) return false;
    for (let i = 0; i < FAMILY_ORDER.length; i++) {
      setFamilyGain(FAMILY_ORDER[i], arr[i]);
    }
    lastPreset = name;
    try { localStorage.setItem(LS_PRESET, name); } catch (_) {}
    try { localStorage.setItem(LS_GAINS, JSON.stringify(getGains())); } catch (_) {}
    return true;
  }

  function getPreset() { return lastPreset; }

  // Hydrate from localStorage. mix_gains wins (covers custom-fader state);
  // mix_preset is informational so the UI can show the last-applied label.
  try {
    const rawGains = localStorage.getItem(LS_GAINS);
    if (rawGains) {
      const arr = JSON.parse(rawGains);
      if (Array.isArray(arr) && arr.length === FAMILY_ORDER.length) {
        for (let i = 0; i < FAMILY_ORDER.length; i++) {
          setFamilyGain(FAMILY_ORDER[i], arr[i]);
        }
      }
    }
    const rawPreset = localStorage.getItem(LS_PRESET);
    if (rawPreset && PRESETS[rawPreset]) lastPreset = rawPreset;
  } catch (_) {}

  return {
    familyGains,
    familyFor: familyForProgram,
    setFamilyGain,
    applyPreset,
    getGains,
    getPreset,
  };
}

/**
 * Render the 7-fader UI into `root` (the #winamp-eq element). Vanilla DOM,
 * no framework. Hooks `input` events back into the mixer + localStorage.
 */
export function renderMixerUI(mixer, root) {
  if (!root) return;
  const facesEl = root.querySelector('#eq-faders');
  const presetEl = root.querySelector('#eq-preset');
  const resetEl = root.querySelector('#eq-reset');
  if (!facesEl) return;

  facesEl.innerHTML = '';
  const inputs = new Map();
  const gains = mixer.getGains();
  for (let i = 0; i < FAMILY_ORDER.length; i++) {
    const name = FAMILY_ORDER[i];
    const cell = document.createElement('div');
    cell.className = 'eq-fader';
    const input = document.createElement('input');
    input.type = 'range';
    input.min = '0'; input.max = '150'; input.step = '1';
    input.value = String(Math.round(gains[i] * 100));
    input.setAttribute('orient', 'vertical');
    input.setAttribute('aria-label', name + ' gain');
    const label = document.createElement('span');
    label.className = 'mono dim eq-fader-label';
    label.textContent = name.toUpperCase();
    cell.appendChild(input); cell.appendChild(label);
    facesEl.appendChild(cell);
    inputs.set(name, input);

    input.addEventListener('input', () => {
      mixer.setFamilyGain(name, parseInt(input.value, 10) / 100);
      try { localStorage.setItem('mix_gains', JSON.stringify(mixer.getGains())); } catch (_) {}
      if (presetEl) presetEl.value = '';
    });
  }

  function syncFaders() {
    const g = mixer.getGains();
    for (let i = 0; i < FAMILY_ORDER.length; i++) {
      const inp = inputs.get(FAMILY_ORDER[i]);
      if (inp) inp.value = String(Math.round(g[i] * 100));
    }
  }

  if (presetEl) {
    presetEl.value = mixer.getPreset();
    presetEl.addEventListener('change', () => {
      const v = presetEl.value;
      if (PRESETS[v] && mixer.applyPreset(v)) syncFaders();
    });
  }
  if (resetEl) {
    resetEl.addEventListener('click', () => {
      mixer.applyPreset('Flat');
      if (presetEl) presetEl.value = 'Flat';
      syncFaders();
    });
  }
}

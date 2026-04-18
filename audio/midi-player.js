/**
 * MIDI playback via @tonejs/midi (global `Midi`) + Web Audio oscillators.
 * Installs globalThis.__dadeAudioMasterIn -> analyser -> destination for viz + synth mix.
 */

const OSC_TYPES = ['square', 'sawtooth', 'triangle'];

function getMidiClass() {
  const M = globalThis.Midi;
  if (!M) throw new Error('Midi global missing; load @tonejs/midi before this module');
  return M;
}

function getCtx() {
  if (!globalThis.__dadeAudioCtx) {
    const AC = globalThis.AudioContext || globalThis.webkitAudioContext;
    globalThis.__dadeAudioCtx = new AC();
  }
  return globalThis.__dadeAudioCtx;
}

function midiToHz(n) {
  return 440 * Math.pow(2, (n - 69) / 12);
}

function ensureAudioGraph(ctx) {
  if (globalThis.__dadeAudioMasterIn) return;

  const masterIn = ctx.createGain();
  masterIn.gain.value = 1;
  const analyser = ctx.createAnalyser();
  analyser.fftSize = 512;
  analyser.smoothingTimeConstant = 0.65;
  masterIn.connect(analyser);
  analyser.connect(ctx.destination);

  globalThis.__dadeAudioMasterIn = masterIn;
  globalThis.__dadeAudioAnalyser = analyser;
}

function collectNotes(midi) {
  const out = [];
  for (const track of midi.tracks) {
    const ch = track.channel || 0;
    for (const note of track.notes) {
      out.push({
        t: note.time,
        d: Math.max(0.02, note.duration),
        m: note.midi,
        v: note.velocity ?? 0.7,
        ch,
      });
    }
  }
  out.sort((a, b) => a.t - b.t);
  return out;
}

export function initMidiPlayer({ midiUrl, canvas }) {
  const MidiClass = getMidiClass();
  const ctx = getCtx();
  ensureAudioGraph(ctx);

  const midiGain = ctx.createGain();
  midiGain.gain.value = 1;
  midiGain.connect(globalThis.__dadeAudioMasterIn);

  let notes = [];
  let loopDur = 4;
  let scheduleTimer = null;
  let rafId = 0;
  let vizStarted = false;
  let midiRunning = false;
  let scheduledUntil = 0;
  const active = new Set();

  const c2d = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;
  const half = Math.floor(H / 2);
  const barCount = 16;
  const barW = W / barCount;
  const timeData = new Uint8Array(512);
  const freqData = new Uint8Array(256);
  let lastDraw = 0;

  function drawFrame(ts) {
    rafId = requestAnimationFrame(drawFrame);
    if (ts - lastDraw < 15.5) return;
    lastDraw = ts;

    const an = globalThis.__dadeAudioAnalyser;
    if (!an || !c2d) return;

    an.getByteTimeDomainData(timeData);
    an.getByteFrequencyData(freqData);

    c2d.fillStyle = '#000033';
    c2d.fillRect(0, 0, W, half);
    c2d.strokeStyle = '#00ff88';
    c2d.lineWidth = 1;
    c2d.beginPath();
    for (let x = 0; x < W; x++) {
      const i = Math.floor((x / W) * timeData.length);
      const v = (timeData[i] - 128) / 128;
      const y = half / 2 - v * (half / 2 - 2);
      if (x === 0) c2d.moveTo(x, y);
      else c2d.lineTo(x, y);
    }
    c2d.stroke();

    c2d.fillStyle = '#1a0033';
    c2d.fillRect(0, half, W, H - half);
    const bottomH = H - half;
    for (let b = 0; b < barCount; b++) {
      const i0 = Math.floor((b / barCount) * (freqData.length - 1));
      const i1 = Math.floor(((b + 1) / barCount) * (freqData.length - 1));
      let peak = 0;
      for (let j = i0; j <= i1; j++) peak = Math.max(peak, freqData[j]);
      const bh = (peak / 255) * (bottomH - 4);
      const hue = 120 + (b / barCount) * 80;
      c2d.fillStyle = `hsl(${hue}, 90%, 55%)`;
      c2d.fillRect(b * barW + 1, H - bh - 2, barW - 2, bh);
    }
  }

  function scheduleWindow(fromT, toT) {
    for (const n of notes) {
      let k = Math.floor((fromT - n.t) / loopDur);
      let start = n.t + k * loopDur;
      while (start < fromT - 0.001) {
        k += 1;
        start = n.t + k * loopDur;
      }
      let guard = 0;
      while (start < toT && guard++ < 65536) {
        if (start + n.d > fromT - 0.08 && start >= ctx.currentTime - 0.12) {
          playNote(n, start);
        }
        k += 1;
        start = n.t + k * loopDur;
      }
    }
  }

  function playNote(n, start) {
    if (start < ctx.currentTime - 0.08) return;
    const att = 0.004;
    const rel = 0.035;
    const end = start + n.d;
    const type = OSC_TYPES[Math.abs(n.ch + n.m) % OSC_TYPES.length];
    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(midiToHz(n.m), start);
    const g = ctx.createGain();
    const vel = Math.min(1, Math.max(0.05, n.v)) * 0.22;
    g.gain.setValueAtTime(0.0001, start);
    g.gain.exponentialRampToValueAtTime(vel, start + att);
    g.gain.setValueAtTime(vel, Math.max(start + att, end - rel));
    g.gain.exponentialRampToValueAtTime(0.0001, end);
    osc.connect(g);
    g.connect(midiGain);
    osc.start(start);
    osc.stop(end + 0.06);
    active.add(osc);
    active.add(g);
    const clean = () => {
      active.delete(osc);
      active.delete(g);
    };
    osc.onended = clean;
  }

  function pumpSchedule() {
    if (!midiRunning) return;
    const now = ctx.currentTime;
    const target = now + 16;
    if (scheduledUntil < target) {
      scheduleWindow(Math.max(now - 0.1, scheduledUntil - 2), target);
      scheduledUntil = target;
    }
  }

  const loadPromise = fetch(midiUrl)
    .then((r) => {
      if (!r.ok) throw new Error('MIDI fetch failed: ' + midiUrl);
      return r.arrayBuffer();
    })
    .then((buf) => {
      const midi = new MidiClass(buf);
      notes = collectNotes(midi);
      loopDur = Math.max(0.5, midi.duration || 4);
      return null;
    });

  function startVisualizer() {
    if (vizStarted) return;
    vizStarted = true;
    lastDraw = 0;
    cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(drawFrame);
  }

  function startMidi() {
    if (midiRunning) return;
    midiRunning = true;
    scheduledUntil = ctx.currentTime + 0.06;
    scheduleWindow(ctx.currentTime - 0.05, scheduledUntil + 14);
    if (scheduleTimer) clearInterval(scheduleTimer);
    scheduleTimer = setInterval(pumpSchedule, 350);
  }

  function stopMidi() {
    midiRunning = false;
    if (scheduleTimer) clearInterval(scheduleTimer);
    scheduleTimer = null;
    for (const node of active) {
      try {
        node.stop?.(0);
        node.disconnect?.();
      } catch (_) {
        /* ignore */
      }
    }
    active.clear();
  }

  function setMidiAudible(on, rampSec = 0.02) {
    const now = ctx.currentTime;
    midiGain.gain.cancelScheduledValues(now);
    midiGain.gain.setValueAtTime(midiGain.gain.value, now);
    midiGain.gain.linearRampToValueAtTime(on ? 1 : 0, now + rampSec);
  }

  return loadPromise.then(() => ({
    startMidi,
    stopMidi,
    setMidiAudible,
    startVisualizer,
  }));
}

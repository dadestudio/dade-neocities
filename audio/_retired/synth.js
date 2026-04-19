/**
 * Procedural loop synth tracks — shared AudioContext via globalThis.__dadeAudioCtx
 * (created only from play(), never at module load).
 */

function getCtx() {
  if (!globalThis.__dadeAudioCtx) {
    const AC = globalThis.AudioContext || globalThis.webkitAudioContext;
    globalThis.__dadeAudioCtx = new AC();
  }
  return globalThis.__dadeAudioCtx;
}

function getDest() {
  const bus = globalThis.__dadeAudioMasterIn;
  const ctx = getCtx();
  return bus || ctx.destination;
}

function makeNoiseBuffer(ctx, seconds) {
  const len = Math.max(1, Math.floor(ctx.sampleRate * seconds));
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  return buf;
}

/**
 * @param {AudioNode} dest
 * @param {number} t0
 * @param {number} tEnd
 */
function envelopeGain(ctx, dest, t0, tEnd) {
  const g = ctx.createGain();
  const fade = 0.01;
  g.connect(dest);
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(1, t0 + fade);
  g.gain.setValueAtTime(1, Math.max(t0 + fade, tEnd - fade));
  g.gain.linearRampToValueAtTime(0, tEnd);
  return g;
}

function createTrackState() {
  return {
    timers: [],
    nodes: [],
    periodSec: 4,
    refreshId: 0,
  };
}

function clearTrack(state) {
  state.refreshId++;
  for (const id of state.timers) clearTimeout(id);
  state.timers.length = 0;
  for (const n of state.nodes) {
    try {
      n.stop?.(0);
      n.disconnect?.();
    } catch (_) {
      /* ignore */
    }
  }
  state.nodes.length = 0;
}

/**
 * Schedule overlapping segments with 10ms crossfade at each loop boundary.
 */
function scheduleLoopSegment(ctx, state, period, t0, buildVoices) {
  const tEnd = t0 + period;
  const env = ctx.createGain();
  env.connect(getDest());
  const fade = 0.01;
  env.gain.setValueAtTime(0, t0);
  env.gain.linearRampToValueAtTime(1, t0 + fade);
  env.gain.setValueAtTime(1, Math.max(t0 + fade, tEnd - fade));
  env.gain.linearRampToValueAtTime(0, tEnd);
  state.nodes.push(env);
  buildVoices(env, t0, tEnd);
}

function armLoopRefresh(ctx, state, period, buildVoices) {
  const myId = state.refreshId;
  const horizon = 25;
  const overlap = 0.01;
  const step = period - overlap;
  function scheduleAhead() {
    if (state.refreshId !== myId) return;
    const now = ctx.currentTime;
    const start = now + 0.08;
    const cycles = Math.ceil((horizon + period) / step);
    for (let i = 0; i < cycles; i++) {
      const t0 = start + i * step;
      scheduleLoopSegment(ctx, state, period, t0, buildVoices);
    }
    const tid = setTimeout(scheduleAhead, (horizon - 5) * 1000);
    state.timers.push(tid);
  }
  scheduleAhead();
}

/** Cyberspace — driving saw + square + filtered noise feel (noise only) */
function makeCyberspace() {
  const state = createTrackState();
  state.periodSec = 3.2;
  const period = state.periodSec;
  return {
    name: 'Cyberspace',
    play() {
      const ctx = getCtx();
      clearTrack(state);
      const noiseBuf = makeNoiseBuffer(ctx, 2);
      armLoopRefresh(ctx, state, period, (env, t0, tEnd) => {
        const o1 = ctx.createOscillator();
        o1.type = 'sawtooth';
        o1.frequency.setValueAtTime(110, t0);
        o1.connect(env);
        o1.start(t0);
        o1.stop(tEnd + 0.05);
        state.nodes.push(o1);

        const o2 = ctx.createOscillator();
        o2.type = 'square';
        o2.frequency.setValueAtTime(220, t0);
        o2.detune.setValueAtTime(7, t0);
        o2.connect(env);
        o2.start(t0);
        o2.stop(tEnd + 0.05);
        state.nodes.push(o2);

        const ns = ctx.createBufferSource();
        ns.buffer = noiseBuf;
        ns.loop = true;
        const ng = ctx.createGain();
        ng.gain.setValueAtTime(0.04, t0);
        ns.connect(ng);
        ng.connect(env);
        ns.start(t0);
        ns.stop(tEnd + 0.05);
        state.nodes.push(ns, ng);
      });
    },
    stop() {
      clearTrack(state);
    },
  };
}

/** Geocity Blues — triangle bass + fifth + mellow triangle lead */
function makeGeocityBlues() {
  const state = createTrackState();
  state.periodSec = 6.4;
  const period = state.periodSec;
  return {
    name: 'Geocity Blues',
    play() {
      const ctx = getCtx();
      clearTrack(state);
      armLoopRefresh(ctx, state, period, (env, t0, tEnd) => {
        const b = ctx.createOscillator();
        b.type = 'triangle';
        b.frequency.setValueAtTime(98, t0);
        b.connect(env);
        b.start(t0);
        b.stop(tEnd + 0.05);
        state.nodes.push(b);

        const f = ctx.createOscillator();
        f.type = 'triangle';
        f.frequency.setValueAtTime(147, t0);
        f.connect(env);
        f.start(t0);
        f.stop(tEnd + 0.05);
        state.nodes.push(f);

        const steps = [196, 220, 233, 196];
        const stepDur = period / steps.length;
        for (let i = 0; i < steps.length; i++) {
          const st = t0 + i * stepDur;
          const ed = t0 + (i + 1) * stepDur;
          const mel = ctx.createOscillator();
          mel.type = 'triangle';
          mel.frequency.setValueAtTime(steps[i], st);
          const mg = envelopeGain(ctx, env, st, ed);
          mel.connect(mg);
          mel.start(st);
          mel.stop(ed + 0.05);
          state.nodes.push(mel, mg);
        }
      });
    },
    stop() {
      clearTrack(state);
    },
  };
}

/** Modem Dial — square tones + short noise bursts */
function makeModemDial() {
  const state = createTrackState();
  state.periodSec = 4.8;
  const period = state.periodSec;
  return {
    name: 'Modem Dial',
    play() {
      const ctx = getCtx();
      clearTrack(state);
      const noiseBuf = makeNoiseBuffer(ctx, 0.25);
      armLoopRefresh(ctx, state, period, (env, t0, tEnd) => {
        const freqs = [350, 440, 480, 400, 350];
        const slice = period / freqs.length;
        for (let i = 0; i < freqs.length; i++) {
          const st = t0 + i * slice;
          const ed = st + slice * 0.72;
          const sq = ctx.createOscillator();
          sq.type = 'square';
          sq.frequency.setValueAtTime(freqs[i], st);
          const g = envelopeGain(ctx, env, st, ed);
          sq.connect(g);
          sq.start(st);
          sq.stop(ed + 0.05);
          state.nodes.push(sq, g);
        }

        const burstT = t0 + period * 0.62;
        const burstEnd = burstT + 0.14;
        const ns = ctx.createBufferSource();
        ns.buffer = noiseBuf;
        const ng = ctx.createGain();
        ng.gain.setValueAtTime(0.12, burstT);
        ns.connect(ng);
        ng.connect(env);
        ns.start(burstT);
        ns.stop(burstEnd + 0.02);
        state.nodes.push(ns, ng);
      });
    },
    stop() {
      clearTrack(state);
    },
  };
}

export const tracks = [makeCyberspace(), makeGeocityBlues(), makeModemDial()];

/**
 * Winamp-style multi-instrument MIDI player.
 * Parses .mid via @tonejs/midi (global Midi), renders via soundfont-player
 * (global Soundfont) using the FluidR3_GM SoundFont, mixes through a master
 * gain → AnalyserNode → destination. SFX module shares the same context via
 * globalThis.__dadeAudioCtx.
 *
 * Scheduling is a rolling lookahead (~500 ms) driven by rAF — never schedule
 * the whole track up front, or the WebAudio renderer will fault on long MIDIs
 * (thousands of BufferSourceNodes saturate the audio thread).
 */

import { createMixer, renderMixerUI, FAMILY_ORDER } from './eq-mixer.js';

const GM_NAMES = [
  'acoustic_grand_piano','bright_acoustic_piano','electric_grand_piano','honkytonk_piano',
  'electric_piano_1','electric_piano_2','harpsichord','clavinet',
  'celesta','glockenspiel','music_box','vibraphone',
  'marimba','xylophone','tubular_bells','dulcimer',
  'drawbar_organ','percussive_organ','rock_organ','church_organ',
  'reed_organ','accordion','harmonica','tango_accordion',
  'acoustic_guitar_nylon','acoustic_guitar_steel','electric_guitar_jazz','electric_guitar_clean',
  'electric_guitar_muted','overdriven_guitar','distortion_guitar','guitar_harmonics',
  'acoustic_bass','electric_bass_finger','electric_bass_pick','fretless_bass',
  'slap_bass_1','slap_bass_2','synth_bass_1','synth_bass_2',
  'violin','viola','cello','contrabass',
  'tremolo_strings','pizzicato_strings','orchestral_harp','timpani',
  'string_ensemble_1','string_ensemble_2','synth_strings_1','synth_strings_2',
  'choir_aahs','voice_oohs','synth_choir','orchestra_hit',
  'trumpet','trombone','tuba','muted_trumpet',
  'french_horn','brass_section','synth_brass_1','synth_brass_2',
  'soprano_sax','alto_sax','tenor_sax','baritone_sax',
  'oboe','english_horn','bassoon','clarinet',
  'piccolo','flute','recorder','pan_flute',
  'blown_bottle','shakuhachi','whistle','ocarina',
  'lead_1_square','lead_2_sawtooth','lead_3_calliope','lead_4_chiff',
  'lead_5_charang','lead_6_voice','lead_7_fifths','lead_8_bass__lead',
  'pad_1_new_age','pad_2_warm','pad_3_polysynth','pad_4_choir',
  'pad_5_bowed','pad_6_metallic','pad_7_halo','pad_8_sweep',
  'fx_1_rain','fx_2_soundtrack','fx_3_crystal','fx_4_atmosphere',
  'fx_5_brightness','fx_6_goblins','fx_7_echoes','fx_8_scifi',
  'sitar','banjo','shamisen','koto','kalimba','bagpipe','fiddle','shanai',
  'tinkle_bell','agogo','steel_drums','woodblock','taiko_drum','melodic_tom','synth_drum','reverse_cymbal',
  'guitar_fret_noise','breath_noise','seashore','bird_tweet','telephone_ring','helicopter','applause','gunshot',
];

const LS_VOL = 'lofi_volume';
const LS_IDX = 'lofi_track';
const SF_HOST = 'FluidR3_GM';
const FALLBACK_INST = 'acoustic_grand_piano';
const PERCUSSION_INST = 'percussion';
const SCHED_LOOKAHEAD = 0.5;

// GM channel-9 percussion: MIDI note number IS the drum voice (35=Bass Drum,
// 38=Snare, 42=Closed HH, 49=Crash, etc.) — there is no Program Change lookup.
// The bundled FluidR3 percussion sample set covers MIDI 27-87 (Eb1..Eb6); GM
// standard kit lives at 35-81. Notes outside the bundle range are silently
// dropped at schedule time (warned once) — no pitched-piano fallback for drums.
const PERCUSSION_MIDI_LO = 27;
const PERCUSSION_MIDI_HI = 87;

function lsGetNum(k, d) {
  try { const v = parseFloat(localStorage.getItem(k)); return isFinite(v) ? v : d; } catch (_) { return d; }
}
function lsSet(k, v) { try { localStorage.setItem(k, String(v)); } catch (_) {} }

function fmtTime(s) {
  if (!isFinite(s) || s < 0) s = 0;
  const m = Math.floor(s / 60), r = Math.floor(s % 60);
  return m + ':' + (r < 10 ? '0' : '') + r;
}

function buildFullDOM(mountEl, compact) {
  const cls = compact ? 'audio-mount compact' : 'audio-mount full';
  mountEl.innerHTML = compact
    ? '<h2 class="panel-header">// audio</h2><div class="' + cls + '">'
        + '<div class="lcd lcd-scroll"><span data-role="lcd">[ loading... ]</span></div>'
        + '<div class="player-controls"><button class="btn" data-act="toggle">[ &#9654; ]</button></div>'
        + '<canvas data-role="viz" width="200" height="24"></canvas></div>'
    : '<h2 class="panel-header">// winamp // FluidR3_GM</h2><div class="' + cls + '">'
        + '<div class="lcd lcd-scroll"><span data-role="lcd">[ press play ]</span></div>'
        + '<div class="mono dim" style="margin-top:var(--space-1);"><span data-role="time">0:00 / 0:00</span> <span class="sf-loading" data-role="loading"></span></div>'
        + '<div class="player-controls">'
          + '<button class="btn" data-act="prev" title="prev">&#9664;&#9664;</button>'
          + '<button class="btn" data-act="play" title="play">&#9654;</button>'
          + '<button class="btn" data-act="pause" title="pause">&#10074;&#10074;</button>'
          + '<button class="btn" data-act="stop" title="stop">&#9632;</button>'
          + '<button class="btn" data-act="next" title="next">&#9654;&#9654;</button>'
        + '</div>'
        + '<input type="range" class="vol" data-role="vol" min="0" max="100" value="60" aria-label="volume">'
        + '<canvas data-role="viz" width="280" height="48"></canvas></div>';
  const q = (s) => mountEl.querySelector(s);
  return { lcd: q('[data-role=lcd]'), time: q('[data-role=time]'), loading: q('[data-role=loading]'), vol: q('[data-role=vol]'), viz: q('[data-role=viz]') };
}

export function initPlayer({ mountEl, tracks, compact = false }) {
  if (!mountEl || !tracks || !tracks.length) return null;
  const Midi = globalThis.Midi;
  const Soundfont = globalThis.Soundfont;
  if (!Midi || !Soundfont) { console.error('player: Midi/Soundfont globals missing'); return null; }

  const ui = buildFullDOM(mountEl, compact);
  const instrumentCache = new Map();

  let ctx = null, masterGain = null, analyser = null, freq = null, mixer = null;
  let uiVol = lsGetNum(LS_VOL, 0.6);
  let trackIdx = Math.max(0, Math.min(tracks.length - 1, Math.floor(lsGetNum(LS_IDX, 0))));
  let parsedMidi = null;
  let trackInstruments = [];
  let noteList = [];
  let noteCursor = 0;
  let totalDur = 0;
  let offsetSec = 0;
  let playheadStart = 0;
  let activeNotes = [];
  let isPlaying = false;
  let pendingTrack = null;
  let scheduleErrorLogged = false;
  if (ui.vol) ui.vol.value = String(Math.round(uiVol * 100));

  function ensureCtx() {
    if (ctx) return;
    const AC = globalThis.AudioContext || globalThis.webkitAudioContext;
    if (!AC) throw new Error('WebAudio unsupported');
    ctx = globalThis.__dadeAudioCtx || new AC();
    globalThis.__dadeAudioCtx = ctx;
    masterGain = ctx.createGain();
    analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    masterGain.connect(analyser); analyser.connect(ctx.destination);
    freq = new Uint8Array(analyser.frequencyBinCount);
    globalThis.__dadeAudioMasterIn = masterGain;
    globalThis.__dadeAudioAnalyser = analyser;
    // T13: per-family fan-in lives between the instruments and masterGain.
    // The masterGain -> analyser -> destination chain above is intentionally
    // unchanged so the spectrum viz keeps reading the post-mix signal.
    mixer = createMixer(ctx, masterGain);
    wireMixerUI();
    applyVolume();
  }

  function applyVolume() { if (masterGain) masterGain.gain.value = uiVol; }
  function setVolume(v) { uiVol = Math.max(0, Math.min(1, Number(v))); lsSet(LS_VOL, uiVol); applyVolume(); }

  function setLCD() {
    const t = tracks[trackIdx];
    const num = String(trackIdx + 1).padStart(2, '0');
    if (ui.lcd) ui.lcd.textContent = num + '. ' + t.artist + ' \u2014 ' + t.title;
  }

  function programNameFor(track) {
    if (track.channel === 9) return PERCUSSION_INST;
    const p = (track.instrument && track.instrument.number) || 0;
    return GM_NAMES[Math.max(0, Math.min(127, p))];
  }

  function familyForInstrumentName(name) {
    if (name === PERCUSSION_INST) return 'perc';
    const idx = GM_NAMES.indexOf(name);
    if (idx < 0) return 'other';
    return mixer ? mixer.familyFor(idx, false) : 'other';
  }

  async function ensureInstrument(name) {
    if (instrumentCache.has(name)) return instrumentCache.get(name);
    const family = familyForInstrumentName(name);
    const dest = (mixer && mixer.familyGains.get(family)) || masterGain;
    const opts = {
      soundfont: SF_HOST,
      format: 'mp3',
      nameToUrl: (n, sf) => `/sounds/soundfonts/${sf}/${n}-mp3.js`,
      destination: dest,
    };
    const isPerc = name === PERCUSSION_INST;
    const p = Soundfont.instrument(ctx, name, opts)
      .catch((err) => {
        if (isPerc) {
          // Drum kit MUST NOT fall back to a pitched piano — that would emit
          // wrong-pitched melodic noise on every drum hit. Re-raise so the
          // whole percussion track is dropped cleanly.
          console.warn('player: percussion kit unavailable, channel 9 will be silent', err);
          throw err;
        }
        if (name === FALLBACK_INST) throw err;
        console.warn('player: ' + name + ' unavailable, falling back to ' + FALLBACK_INST, err);
        return Soundfont.instrument(ctx, FALLBACK_INST, opts);
      })
      .then((inst) => { instrumentCache.set(name, inst); return inst; })
      .catch((err) => { instrumentCache.delete(name); throw err; });
    instrumentCache.set(name, p);
    return p;
  }

  async function loadTrack(idx) {
    pendingTrack = idx;
    stopAllNotes(); offsetSec = 0; isPlaying = false;
    parsedMidi = null;
    const tr = tracks[idx];
    setLCD();
    if (ui.loading) ui.loading.textContent = '[ loading midi... ]';
    const buf = await fetch(tr.src).then((r) => { if (!r.ok) throw new Error('mid 404 ' + tr.src); return r.arrayBuffer(); });
    if (pendingTrack !== idx) return null;
    const midi = new Midi(buf);
    // Keep channel 9 in scope — it carries the GM drum kit and was excluded
    // by T9.1. Percussion is loaded as the 'percussion' instrument and routed
    // by note number rather than program number (handled in scheduleAhead).
    const playable = midi.tracks.filter((t) => t.notes && t.notes.length);
    const names = Array.from(new Set(playable.map(programNameFor)));
    let loaded = 0;
    if (ui.loading) ui.loading.textContent = '[ loading soundfonts... 0/' + names.length + ' ]';
    const insts = await Promise.all(names.map(async (n) => {
      try {
        const inst = await ensureInstrument(n);
        loaded += 1;
        if (ui.loading && pendingTrack === idx) ui.loading.textContent = '[ loading soundfonts... ' + loaded + '/' + names.length + ' ]';
        return [n, inst];
      } catch (e) {
        // Per-instrument load failure: log and skip this track. Percussion
        // takes this branch when the kit bundle is absent so the rest of the
        // mix still plays.
        console.warn('player: skipping instrument', n, e);
        loaded += 1;
        if (ui.loading && pendingTrack === idx) ui.loading.textContent = '[ loading soundfonts... ' + loaded + '/' + names.length + ' ]';
        return [n, null];
      }
    }));
    if (pendingTrack !== idx) return null;
    const nameMap = new Map(insts);
    parsedMidi = midi;
    trackInstruments = playable.map((t) => ({
      inst: nameMap.get(programNameFor(t)),
      notes: t.notes,
      isDrum: t.channel === 9,
    }));
    totalDur = midi.duration || playable.reduce((m, t) => Math.max(m, t.notes.reduce((mm, n) => Math.max(mm, n.time + n.duration), 0)), 0);
    noteList = [];
    for (let i = 0; i < trackInstruments.length; i++) {
      const ti = trackInstruments[i];
      for (const n of ti.notes) {
        noteList.push({
          time: n.time,
          duration: n.duration,
          name: n.name,
          midi: n.midi,
          velocity: n.velocity || 0.7,
          instIdx: i,
          isDrum: ti.isDrum,
        });
      }
    }
    noteList.sort((a, b) => a.time - b.time);
    if (ui.loading) ui.loading.textContent = '';
    return midi;
  }

  function startPlayback() {
    activeNotes = [];
    scheduleErrorLogged = false;
    playheadStart = ctx.currentTime + 0.05 - offsetSec;
    noteCursor = 0;
    while (noteCursor < noteList.length && noteList[noteCursor].time + noteList[noteCursor].duration <= offsetSec) noteCursor++;
    isPlaying = true;
  }

  function scheduleAhead() {
    if (!isPlaying || !ctx) return;
    const horizon = ctx.currentTime + SCHED_LOOKAHEAD;
    while (noteCursor < noteList.length) {
      const n = noteList[noteCursor];
      const when = playheadStart + n.time;
      if (when > horizon) break;
      noteCursor++;
      const ti = trackInstruments[n.instIdx];
      if (!ti || !ti.inst) continue;
      const startAt = Math.max(when, ctx.currentTime);
      try {
        let node;
        if (n.isDrum) {
          // GM percussion: each MIDI note number is a distinct drum voice
          // resolved out of the 'percussion' bundle by note name. Drums
          // play to natural decay (no duration cap) and are silently
          // dropped if outside the bundled kit range — never fall back
          // to a pitched piano sample.
          if (n.midi < PERCUSSION_MIDI_LO || n.midi > PERCUSSION_MIDI_HI) {
            warnMissingDrum(n.midi);
            continue;
          }
          node = ti.inst.play(n.name, startAt, { gain: Math.max(0.05, n.velocity) });
        } else {
          const dur = Math.max(0.05, n.duration - Math.max(0, offsetSec - n.time));
          node = ti.inst.play(n.name, startAt, { duration: dur, gain: Math.max(0.05, n.velocity) });
        }
        if (node) activeNotes.push(node);
      } catch (e) {
        if (!scheduleErrorLogged) { console.error('player: note schedule error', e); scheduleErrorLogged = true; }
      }
    }
    if (activeNotes.length > 256) activeNotes = activeNotes.slice(-128);
  }

  const missingDrumWarned = new Set();
  function warnMissingDrum(midi) {
    if (missingDrumWarned.has(midi)) return;
    missingDrumWarned.add(midi);
    console.warn('player: drop drum note ' + midi + ' (outside FluidR3 percussion kit range ' + PERCUSSION_MIDI_LO + '-' + PERCUSSION_MIDI_HI + ')');
  }

  function stopAllNotes() {
    for (const n of activeNotes) { try { n && n.stop && n.stop(); } catch (_) {} }
    activeNotes = [];
    for (const inst of instrumentCache.values()) {
      if (inst && typeof inst.stop === 'function' && !(inst instanceof Promise)) {
        try { inst.stop(); } catch (_) {}
      }
    }
  }

  async function play() {
    try {
      ensureCtx();
      if (ctx.state === 'suspended') await ctx.resume();
      if (!parsedMidi || pendingTrack !== trackIdx) {
        await loadTrack(trackIdx);
      }
      if (!parsedMidi) return;
      if (ctx.state === 'suspended') await ctx.resume();
      startPlayback();
    } catch (e) {
      console.error('player: play failed', e);
      isPlaying = false;
      if (ui.loading) ui.loading.textContent = '[ error: ' + (e && e.message ? e.message : e) + ' ]';
    }
  }
  function pause() {
    if (!isPlaying || !ctx) return;
    offsetSec = Math.max(0, ctx.currentTime - playheadStart);
    stopAllNotes(); isPlaying = false;
  }
  function stop() { stopAllNotes(); offsetSec = 0; isPlaying = false; }
  function next() { setTrackIndex((trackIdx + 1) % tracks.length, true); }
  function prev() { setTrackIndex((trackIdx - 1 + tracks.length) % tracks.length, true); }
  async function setTrackIndex(i, autoplay) {
    trackIdx = ((i % tracks.length) + tracks.length) % tracks.length;
    lsSet(LS_IDX, trackIdx);
    parsedMidi = null;
    setLCD();
    if (autoplay) await play();
  }

  mountEl.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-act]'); if (!btn) return;
    const act = btn.dataset.act;
    if (act === 'play') play();
    else if (act === 'pause') pause();
    else if (act === 'stop') stop();
    else if (act === 'next') next();
    else if (act === 'prev') prev();
    else if (act === 'toggle') { isPlaying ? pause() : play(); }
  });
  if (ui.vol) ui.vol.addEventListener('input', () => setVolume(parseInt(ui.vol.value, 10) / 100));

  let mixerUIReady = false;
  function wireMixerUI() {
    if (mixerUIReady || !mixer) return;
    const root = document.getElementById('winamp-eq');
    if (!root) return;
    renderMixerUI(mixer, root);
    mixerUIReady = true;
  }

  const c2d = ui.viz && ui.viz.getContext('2d');
  const VW = ui.viz ? ui.viz.width : 0;
  const VH = ui.viz ? ui.viz.height : 0;
  const BARS = 32;
  function tick() {
    requestAnimationFrame(tick);
    scheduleAhead();
    if (c2d && analyser && freq) {
      analyser.getByteFrequencyData(freq);
      c2d.fillStyle = '#000033'; c2d.fillRect(0, 0, VW, VH);
      const bw = VW / BARS;
      const accent = (getComputedStyle(document.documentElement).getPropertyValue('--accent-neon') || '#00ff9f').trim();
      c2d.fillStyle = accent;
      for (let b = 0; b < BARS; b++) {
        const i0 = Math.floor((b / BARS) * freq.length);
        const i1 = Math.floor(((b + 1) / BARS) * freq.length);
        let peak = 0;
        for (let j = i0; j <= i1 && j < freq.length; j++) peak = Math.max(peak, freq[j]);
        const h = (peak / 255) * (VH - 2);
        c2d.fillRect(b * bw + 1, VH - h, Math.max(1, bw - 2), h);
      }
    }
    if (isPlaying && parsedMidi && ctx) {
      const elapsed = Math.max(0, ctx.currentTime - playheadStart);
      if (ui.time) ui.time.textContent = fmtTime(elapsed) + ' / ' + fmtTime(totalDur);
      if (totalDur > 0 && elapsed >= totalDur - 0.05) { isPlaying = false; offsetSec = 0; setTrackIndex((trackIdx + 1) % tracks.length, true); }
    } else if (ui.time && parsedMidi) {
      ui.time.textContent = fmtTime(offsetSec) + ' / ' + fmtTime(totalDur);
    }
  }
  requestAnimationFrame(tick);

  setLCD();

  return {
    play, pause, stop, next, prev, setVolume, setTrackIndex,
    get mixer() { return mixer; },
    families: FAMILY_ORDER,
  };
}

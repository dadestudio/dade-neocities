/**
 * Winamp-style multi-instrument MIDI player.
 * Parses .mid via @tonejs/midi (global Midi), renders via soundfont-player
 * (global Soundfont) using the FluidR3_GM SoundFont, mixes through a master
 * gain → AnalyserNode → destination. SFX module shares the same context via
 * globalThis.__dadeAudioCtx.
 */

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

function getCtx() {
  if (!globalThis.__dadeAudioCtx) {
    const AC = globalThis.AudioContext || globalThis.webkitAudioContext;
    globalThis.__dadeAudioCtx = new AC();
  }
  return globalThis.__dadeAudioCtx;
}

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
  if (compact) {
    mountEl.innerHTML =
      '<h2 class="panel-header">// audio</h2>' +
      '<div class="' + cls + '">' +
        '<div class="lcd lcd-scroll"><span data-role="lcd">[ loading... ]</span></div>' +
        '<div class="player-controls">' +
          '<button class="btn" data-act="toggle">[ &#9654; ]</button>' +
        '</div>' +
        '<canvas data-role="viz" width="200" height="24"></canvas>' +
      '</div>';
  } else {
    mountEl.innerHTML =
      '<h2 class="panel-header">// winamp // FluidR3_GM</h2>' +
      '<div class="' + cls + '">' +
        '<div class="lcd lcd-scroll"><span data-role="lcd">[ press play ]</span></div>' +
        '<div class="mono dim" style="margin-top:var(--space-1);">' +
          '<span data-role="time">0:00 / 0:00</span> ' +
          '<span class="sf-loading" data-role="loading"></span>' +
        '</div>' +
        '<div class="player-controls">' +
          '<button class="btn" data-act="prev" title="prev">&#9664;&#9664;</button>' +
          '<button class="btn" data-act="play" title="play">&#9654;</button>' +
          '<button class="btn" data-act="pause" title="pause">&#10074;&#10074;</button>' +
          '<button class="btn" data-act="stop" title="stop">&#9632;</button>' +
          '<button class="btn" data-act="next" title="next">&#9654;&#9654;</button>' +
        '</div>' +
        '<input type="range" class="vol" data-role="vol" min="0" max="100" value="60" aria-label="volume">' +
        '<canvas data-role="viz" width="280" height="48"></canvas>' +
      '</div>';
  }
  return {
    lcd: mountEl.querySelector('[data-role=lcd]'),
    time: mountEl.querySelector('[data-role=time]'),
    loading: mountEl.querySelector('[data-role=loading]'),
    vol: mountEl.querySelector('[data-role=vol]'),
    viz: mountEl.querySelector('[data-role=viz]'),
  };
}

export function initPlayer({ mountEl, tracks, compact = false }) {
  if (!mountEl || !tracks || !tracks.length) return null;
  const Midi = globalThis.Midi;
  const Soundfont = globalThis.Soundfont;
  if (!Midi || !Soundfont) { console.error('player: Midi/Soundfont globals missing'); return null; }

  const ctx = getCtx();
  const masterGain = ctx.createGain();
  const analyser = ctx.createAnalyser();
  analyser.fftSize = 256;
  masterGain.connect(analyser); analyser.connect(ctx.destination);
  globalThis.__dadeAudioMasterIn = masterGain;
  globalThis.__dadeAudioAnalyser = analyser;

  const ui = buildFullDOM(mountEl, compact);
  const instrumentCache = new Map();

  let uiVol = lsGetNum(LS_VOL, 0.6);
  let trackIdx = Math.max(0, Math.min(tracks.length - 1, Math.floor(lsGetNum(LS_IDX, 0))));
  let parsedMidi = null;
  let trackInstruments = [];
  let totalDur = 0;
  let offsetSec = 0;
  let playheadStart = 0;
  let activeNotes = [];
  let isPlaying = false;
  let pendingTrack = null;
  applyVolume();
  if (ui.vol) ui.vol.value = String(Math.round(uiVol * 100));

  function applyVolume() { masterGain.gain.value = uiVol; }
  function setVolume(v) { uiVol = Math.max(0, Math.min(1, Number(v))); lsSet(LS_VOL, uiVol); applyVolume(); }

  function setLCD() {
    const t = tracks[trackIdx];
    const num = String(trackIdx + 1).padStart(2, '0');
    if (ui.lcd) ui.lcd.textContent = num + '. ' + t.artist + ' \u2014 ' + t.title;
  }

  function programNameFor(track) {
    if (track.channel === 9) return 'synth_drum';
    const p = (track.instrument && track.instrument.number) || 0;
    return GM_NAMES[Math.max(0, Math.min(127, p))];
  }

  async function ensureInstrument(name) {
    if (instrumentCache.has(name)) return instrumentCache.get(name);
    const p = Soundfont.instrument(ctx, name, {
      soundfont: SF_HOST,
      format: 'mp3',
      nameToUrl: (n, sf, fmt) => `/sounds/soundfonts/${sf}/${n}-mp3.js`,
      destination: masterGain,
    }).then((inst) => {
      instrumentCache.set(name, inst); return inst;
    });
    instrumentCache.set(name, p);
    return p;
  }

  async function loadTrack(idx) {
    pendingTrack = idx;
    stopAllNotes(); offsetSec = 0; isPlaying = false;
    const tr = tracks[idx];
    setLCD();
    if (ui.loading) ui.loading.textContent = '[ loading midi... ]';
    const buf = await fetch(tr.src).then((r) => { if (!r.ok) throw new Error('mid 404 ' + tr.src); return r.arrayBuffer(); });
    if (pendingTrack !== idx) return null;
    const midi = new Midi(buf);
    const playable = midi.tracks.filter((t) => t.notes && t.notes.length && t.channel !== 9);
    const names = Array.from(new Set(playable.map(programNameFor)));
    let loaded = 0;
    if (ui.loading) ui.loading.textContent = '[ loading soundfonts... 0/' + names.length + ' ]';
    const insts = await Promise.all(names.map(async (n) => {
      const inst = await ensureInstrument(n);
      loaded += 1;
      if (ui.loading && pendingTrack === idx) ui.loading.textContent = '[ loading soundfonts... ' + loaded + '/' + names.length + ' ]';
      return [n, inst];
    }));
    if (pendingTrack !== idx) return null;
    const nameMap = new Map(insts);
    parsedMidi = midi;
    trackInstruments = playable.map((t) => ({ inst: nameMap.get(programNameFor(t)), notes: t.notes }));
    totalDur = midi.duration || playable.reduce((m, t) => Math.max(m, t.notes.reduce((mm, n) => Math.max(mm, n.time + n.duration), 0)), 0);
    if (ui.loading) ui.loading.textContent = '';
    return midi;
  }

  function scheduleFromOffset() {
    activeNotes = [];
    const startCtx = ctx.currentTime + 0.05;
    playheadStart = startCtx - offsetSec;
    for (const ti of trackInstruments) {
      for (const n of ti.notes) {
        if (n.time + n.duration <= offsetSec) continue;
        const when = startCtx + Math.max(0, n.time - offsetSec);
        const dur = n.duration - Math.max(0, offsetSec - n.time);
        try {
          const node = ti.inst.play(n.name, when, { duration: Math.max(0.05, dur), gain: Math.max(0.05, n.velocity || 0.7) });
          activeNotes.push(node);
        } catch (_) { /* ignore individual note errors */ }
      }
    }
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
    if (!parsedMidi || pendingTrack !== trackIdx) {
      try { await loadTrack(trackIdx); } catch (e) { console.error(e); return; }
    }
    if (ctx.state === 'suspended') await ctx.resume();
    scheduleFromOffset();
    isPlaying = true;
  }
  function pause() {
    if (!isPlaying) return;
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

  // Controls
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

  // rAF tick: viz + time + auto-advance
  const c2d = ui.viz && ui.viz.getContext('2d');
  const VW = ui.viz ? ui.viz.width : 0;
  const VH = ui.viz ? ui.viz.height : 0;
  const BARS = 32;
  const freq = new Uint8Array(analyser.frequencyBinCount);
  function tick() {
    requestAnimationFrame(tick);
    if (c2d) {
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
    if (isPlaying && parsedMidi) {
      const elapsed = Math.max(0, ctx.currentTime - playheadStart);
      if (ui.time) ui.time.textContent = fmtTime(elapsed) + ' / ' + fmtTime(totalDur);
      if (totalDur > 0 && elapsed >= totalDur - 0.05) { isPlaying = false; offsetSec = 0; setTrackIndex((trackIdx + 1) % tracks.length, true); }
    } else if (ui.time && parsedMidi) {
      ui.time.textContent = fmtTime(offsetSec) + ' / ' + fmtTime(totalDur);
    }
  }
  requestAnimationFrame(tick);

  setLCD();

  return { play, pause, stop, next, prev, setVolume, setTrackIndex };
}

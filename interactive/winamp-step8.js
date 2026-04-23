function readTimeMode() {
  try {
    var mode = localStorage.getItem('wa_time_mode');
    return mode === 'remaining' ? 'remaining' : 'elapsed';
  } catch (e) {
    return 'elapsed';
  }
}

function writeTimeMode(mode) {
  try {
    localStorage.setItem('wa_time_mode', mode === 'remaining' ? 'remaining' : 'elapsed');
  } catch (e) {}
}

function fmtClock(totalSeconds) {
  var safe = isFinite(totalSeconds) ? totalSeconds : 0;
  if (safe < 0) safe = 0;
  var whole = Math.floor(safe);
  var m = Math.floor(whole / 60);
  var s = whole % 60;
  return m + ':' + (s < 10 ? '0' : '') + s;
}

function parseAudioTime(raw) {
  var m = String(raw || '').match(/^(\d+):(\d{2})\s*\/\s*(\d+):(\d{2})$/);
  if (!m) return null;
  var elapsed = (parseInt(m[1], 10) * 60) + parseInt(m[2], 10);
  var duration = (parseInt(m[3], 10) * 60) + parseInt(m[4], 10);
  if (!isFinite(elapsed) || elapsed < 0) elapsed = 0;
  if (!isFinite(duration) || duration < 0) duration = NaN;
  return { elapsed: elapsed, duration: duration };
}

function renderBitmapText(el, label) {
  var fn = window.__waRenderText;
  if (typeof fn === 'function') fn(el, label);
  else el.textContent = label;
}

var localFileBlobUrl = null;
var localFileTickRaf = 0;

function stripExtension(name) {
  return String(name || '').replace(/\.[^/.]+$/, '');
}

function getTimeSourceEl() {
  return document.querySelector('#audio-player-mount [data-role="time"]');
}

function setTrackTitleHint(title) {
  var lcd = document.querySelector('#audio-player-mount [data-role="lcd"]');
  if (!lcd) return;
  lcd.textContent = title || 'LOCAL FILE';
}

function ensureLocalFileAudio() {
  var mount = document.getElementById('audio-player-mount');
  if (!mount) return null;
  var audio = mount.querySelector('audio[data-role="wa-local-file-audio"]');
  if (audio) return audio;
  audio = document.createElement('audio');
  audio.hidden = true;
  audio.preload = 'auto';
  audio.setAttribute('data-role', 'wa-local-file-audio');
  mount.appendChild(audio);
  return audio;
}

function pushLocalFileTime(audio) {
  var source = getTimeSourceEl();
  if (!source) return;
  var elapsed = isFinite(audio.currentTime) ? audio.currentTime : 0;
  var duration = (isFinite(audio.duration) && audio.duration > 0) ? audio.duration : 0;
  source.__waRawSource = fmtClock(elapsed) + ' / ' + fmtClock(duration);
}

function startLocalFileTimeTicker(audio) {
  function tick() {
    if (!audio || audio.paused || audio.ended) {
      localFileTickRaf = 0;
      return;
    }
    pushLocalFileTime(audio);
    localFileTickRaf = requestAnimationFrame(tick);
  }
  if (localFileTickRaf) return;
  localFileTickRaf = requestAnimationFrame(tick);
}

function bindLocalFileClock(audio) {
  if (!audio || audio.__waLocalClockBound) return;
  audio.__waLocalClockBound = true;
  ['loadedmetadata', 'durationchange', 'timeupdate', 'seeked'].forEach(function (evt) {
    audio.addEventListener(evt, function () { pushLocalFileTime(audio); });
  });
  audio.addEventListener('play', function () {
    pushLocalFileTime(audio);
    startLocalFileTimeTicker(audio);
  });
  audio.addEventListener('pause', function () {
    if (localFileTickRaf) {
      cancelAnimationFrame(localFileTickRaf);
      localFileTickRaf = 0;
    }
  });
  audio.addEventListener('ended', function () {
    if (localFileTickRaf) {
      cancelAnimationFrame(localFileTickRaf);
      localFileTickRaf = 0;
    }
    pushLocalFileTime(audio);
  });
}

function initTimeToggle() {
  var source = document.querySelector('#audio-player-mount [data-role="time"]');
  var target = document.querySelector('#winamp-pl .pl-time-display');
  if (!source) return;

  var mode = readTimeMode();
  source.style.cursor = 'pointer';

  source.addEventListener('click', function (e) {
    e.stopPropagation();
    mode = (mode === 'elapsed') ? 'remaining' : 'elapsed';
    writeTimeMode(mode);
  });

  function tick() {
    requestAnimationFrame(tick);
    var raw = source.__waRawSource || source.__lastRawText || '';
    var parsed = parseAudioTime(raw);
    var label = '0:00';
    if (parsed) {
      var hasDuration = isFinite(parsed.duration) && parsed.duration > 0;
      var useRemaining = (mode === 'remaining') && hasDuration;
      if (useRemaining) {
        var remain = Math.max(0, parsed.duration - parsed.elapsed);
        label = '-' + fmtClock(remain);
      } else {
        label = fmtClock(parsed.elapsed);
      }
    }
    if (source.__waTimeLabel !== label) {
      source.__waTimeLabel = label;
      source.setAttribute('data-raw', label);
      renderBitmapText(source, label);
    }
    if (target && target.__waTimeLabel !== label) {
      target.__waTimeLabel = label;
      target.setAttribute('data-raw', label);
      renderBitmapText(target, label);
    }
  }

  requestAnimationFrame(tick);
}

function ensureToggleProxy() {
  var mount = document.getElementById('audio-player-mount');
  if (!mount) return null;
  var btn = mount.querySelector('[data-role="wa-toggle-proxy"]');
  if (btn) return btn;
  btn = document.createElement('button');
  btn.type = 'button';
  btn.hidden = true;
  btn.tabIndex = -1;
  btn.setAttribute('aria-hidden', 'true');
  btn.setAttribute('data-role', 'wa-toggle-proxy');
  btn.setAttribute('data-act', 'toggle');
  mount.appendChild(btn);
  return btn;
}

function initKeyboardShortcuts() {
  var player = window.__dadePlayer;
  var missing = [];
  if (!player || typeof player.play !== 'function') missing.push('play');
  if (!player || typeof player.pause !== 'function') missing.push('pause');
  if (!player || typeof player.stop !== 'function') missing.push('stop');
  if (!player || typeof player.prev !== 'function') missing.push('prev');
  if (!player || typeof player.next !== 'function') missing.push('next');
  if (missing.length) {
    window.__waStep8MissingTransport = missing.slice();
    return;
  }

  var toggleProxy = ensureToggleProxy();
  if (!toggleProxy) {
    window.__waStep8MissingTransport = ['toggle'];
    return;
  }

  var fileLoader = document.getElementById('wa-file-loader');
  if (fileLoader && !fileLoader.__waFileBound) {
    fileLoader.__waFileBound = true;
    fileLoader.addEventListener('change', function (e) {
      var file = e && e.target && e.target.files ? e.target.files[0] : null;
      if (!file) return;

      if (localFileBlobUrl) URL.revokeObjectURL(localFileBlobUrl);
      localFileBlobUrl = URL.createObjectURL(file);

      var title = stripExtension(file.name) || 'LOCAL FILE';
      var usedPlayerUrlApi = false;
      if (player && typeof player.loadUrl === 'function') {
        player.loadUrl(localFileBlobUrl, { autoplay: true, title: title });
        usedPlayerUrlApi = true;
      } else if (player && typeof player.playUrl === 'function') {
        player.playUrl(localFileBlobUrl, title);
        usedPlayerUrlApi = true;
      } else if (player && typeof player.setSource === 'function') {
        player.setSource(localFileBlobUrl, true, title);
        usedPlayerUrlApi = true;
      }

      if (!usedPlayerUrlApi) {
        var audio = ensureLocalFileAudio();
        if (audio) {
          bindLocalFileClock(audio);
          if (player && typeof player.stop === 'function') player.stop();
          audio.src = localFileBlobUrl;
          audio.load();
          var playPromise = audio.play();
          if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {});
          }
          pushLocalFileTime(audio);
        }
      }

      setTrackTitleHint(title);
      fileLoader.value = '';
    });
  }
  var keyActions = {
    z: function () { player.prev(); },
    x: function () { player.play(); },
    c: function () { toggleProxy.click(); },
    v: function () { player.stop(); },
    b: function () { player.next(); }
  };

  document.addEventListener('keydown', function (e) {
    var t = e.target;
    if (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable) return;
    var key = (e.key || '').toLowerCase();
    if (key === ' ' || key === 'spacebar') {
      toggleProxy.click();
      e.preventDefault();
      return;
    }
    if (key === 'l' && e.shiftKey) {
      if (fileLoader) {
        fileLoader.click();
        e.preventDefault();
      }
      return;
    }
    var act = keyActions[key];
    if (!act) return;
    act();
    e.preventDefault();
  });
}

export function initWinampStep8() {
  function attach() {
    if (document.body && document.body.__waStep8Bound) return;
    if (document.body) document.body.__waStep8Bound = true;
    initTimeToggle();
    initKeyboardShortcuts();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attach, { once: true });
  } else {
    attach();
  }
}

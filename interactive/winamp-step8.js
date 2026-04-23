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

function initTimeToggle() {
  var source = document.querySelector('#audio-player-mount [data-role="time"]');
  var target = document.querySelector('#winamp-pl .pl-time-display');
  if (!source || !target) return;

  if (!document.getElementById('wa-time-toggle-style')) {
    var style = document.createElement('style');
    style.id = 'wa-time-toggle-style';
    style.textContent = '.wa-time-toggle-clickable{cursor:pointer;}';
    document.head.appendChild(style);
  }

  var mode = readTimeMode();
  target.classList.add('wa-time-toggle-clickable');

  target.addEventListener('click', function (e) {
    e.stopPropagation();
    mode = (mode === 'elapsed') ? 'remaining' : 'elapsed';
    writeTimeMode(mode);
  });

  function tick() {
    requestAnimationFrame(tick);
    var raw = source.__lastRawText || '';
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
    if (target.__waTimeLabel === label) return;
    target.__waTimeLabel = label;
    target.setAttribute('data-raw', label);
    renderBitmapText(target, label);
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

/** @param {{ onUnlock?: () => void }} opts */
export function initKonami(opts) {
  var onUnlock = (opts && opts.onUnlock) || function () {};
  var seq = [
    'ArrowUp',
    'ArrowUp',
    'ArrowDown',
    'ArrowDown',
    'ArrowLeft',
    'ArrowRight',
    'ArrowLeft',
    'ArrowRight',
    'b',
    'a',
  ];
  var i = 0;

  function secretHref() {
    return /\/pages\//.test(location.pathname) ? 'secret.html' : 'pages/secret.html';
  }

  function injectSecret() {
    var el = document.getElementById('dade-konami-secret');
    if (!el || el.querySelector('a[data-konami-secret]')) return;
    var a = document.createElement('a');
    a.className = 'nav-link';
    a.href = secretHref();
    a.setAttribute('data-konami-secret', '1');
    a.innerHTML = '<font color="#ff6600"><b>[ SECRET ]</b></font>';
    el.appendChild(document.createElement('br'));
    el.appendChild(document.createElement('br'));
    el.appendChild(a);
  }

  function banner() {
    var d = document.createElement('div');
    d.textContent = '[ 30 LIVES GRANTED ]';
    d.setAttribute(
      'style',
      'position:fixed;top:12px;left:0;right:0;text-align:center;z-index:999999;' +
        'background:#000;color:#0f0;font:bold 18px Comic Sans MS,cursive;padding:8px;border:3px solid #ff0;'
    );
    document.body.appendChild(d);
    setTimeout(function () {
      d.remove();
    }, 3000);
  }

  function unlock() {
    try {
      localStorage.setItem('konami_unlocked', '1');
    } catch (e) {}
    injectSecret();
    banner();
    onUnlock();
  }

  function normKey(e) {
    var k = e.key;
    if (k.length === 1 && /[a-z]/i.test(k)) return k.toLowerCase();
    return k;
  }

  function onKey(e) {
    var k = normKey(e);
    if (k !== seq[i]) i = k === seq[0] ? 1 : 0;
    else i++;
    if (i === seq.length) {
      i = 0;
      unlock();
    }
  }

  document.addEventListener('keydown', onKey);
  try {
    if (localStorage.getItem('konami_unlocked') === '1') injectSecret();
  } catch (e) {}
}

export function initEasterEggs() {
  var logo =
    '\n' +
    '  #####    ###   #####   ##### \n' +
    '  #    #  #   #  #    #  #     \n' +
    '  #    #  #####  #    #  ####  \n' +
    '  #    #  #   #  #    #  #     \n' +
    '  #####   #   #  #####   ##### \n' +
    '\n' +
    '  Welcome, fellow web traveler.';
  console.log(logo);

  var img = document.getElementById('dade-under-construction');
  var clicks = 0;
  if (img) {
    img.style.display = 'inline-block';
    img.addEventListener('click', function () {
      clicks++;
      if (clicks < 5) return;
      img.style.transition = 'transform 1.2s ease-in-out';
      img.style.transform = 'rotate(360deg) scaleX(-1)';
      setTimeout(function () {
        img.style.transform = '';
      }, 1250);
      clicks = 0;
    });
  }

  var buf = '';
  document.addEventListener('keydown', function (e) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key.length !== 1) return;
    buf = (buf + e.key.toLowerCase()).slice(-8);
    if (buf.endsWith('dade')) {
      document.body.style.filter = 'invert(1) hue-rotate(180deg)';
      setTimeout(function () {
        document.body.style.filter = '';
      }, 5000);
    }
  });
}

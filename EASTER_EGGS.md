# Easter eggs (dadeog.neocities.org)

1. **Under Construction worker flip** — On the homepage (`index.html`), click the Under Construction GIF five times. The image spins 360° and flips horizontally (CSS `transform`), then resets.
2. **"dade" palette invert** — On the homepage, type the letters `dade` in order anywhere on the page (not in a modifier chord). The page `body` gets `filter: invert(1) hue-rotate(180deg)` for five seconds, then returns to normal.
3. **ASCII welcome** — Loading the homepage runs `initEasterEggs()`, which logs a ~6-line ASCII “DADE” logo and the line `Welcome, fellow web traveler.` to the browser console.

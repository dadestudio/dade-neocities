# Winamp 2 Base 2.91 sprite reference

The homepage audio widget chrome is sprite-sliced from a real classic
Winamp 2 skin (`base-2.91.wsz`) instead of being hand-rolled in CSS. The
`.wsz` ships as a zip of BMP sprite sheets; we converted each BMP to PNG
with macOS `sips` (preserving 1:1 pixel data) and committed them under
`images/winamp-skin/base-2.91/`. The CSS in `styles/theme.css` paints
the chrome by referencing these PNGs as `background-image` with carefully
chosen `background-position` offsets per the public Winamp 2 skin spec
that has been the canonical reference since ~1998.

Every sprite-backed element sets `image-rendering: pixelated` (and the
`-moz-crisp-edges` fallback) so the browser never bilinear-smooths the
bitmaps when the layout DPR is non-integer.

## Source

- Original `.wsz` mirrored from the captbaritone `webamp` repo
  (`packages/webamp/assets/skins/base-2.91.wsz`, MD5
  `5e4f10275dcb1fb211d4a8b4f1bda236`).
- 102,133 byte zip, listed on the Winamp Skin Museum at
  `https://skins.webamp.org/skin/5e4f10275dcb1fb211d4a8b4f1bda236/base-2.91.wsz`.

## License

Base 2.91 skin, classic Winamp 2 user-submitted artwork, widely
redistributed since ~1998. Hosted here under same non-commercial
personal-site posture as the MIDIs.

## Sprite sheet inventory

All sheets live under `images/winamp-skin/base-2.91/` as PNG. Filenames
are lowercase. Pixel dimensions are confirmed via `sips -g pixelWidth -g
pixelHeight` after BMP → PNG conversion (no resampling).

| File           | W × H     | Purpose                                            |
| -------------- | --------- | -------------------------------------------------- |
| `main.png`     | 275 × 116 | Full main-window background (titlebar + body art)  |
| `cbuttons.png` | 136 × 36  | 5 transport buttons; top row normal, bottom row pressed |
| `titlebar.png` | 344 × 87  | Alt titlebar variants (focus / unfocus / shaded)   |
| `numbers.png`  | 99 × 13   | 10 digits 9 × 13 stacked horizontally              |
| `text.png`     | 155 × 74  | 5 × 6 bitmap font (3 main rows of 31 chars + extras) |
| `volume.png`   | 68 × 433  | 28 vol-track frames 68 × 15 stacked + thumb at y = 422 |
| `balance.png`  | 68 × 433  | Same layout as volume; active 38 px area centered  |
| `posbar.png`   | 307 × 10  | Position-bar track + thumb sprite                  |
| `monoster.png` | 58 × 24   | Mono / stereo indicator pair (29 × 12 each)        |
| `shufrep.png`  | 92 × 85   | Shuffle / repeat button states                     |
| `eqmain.png`   | 275 × 315 | EQ window bg (top 116 px) + thumb sprites below    |
| `eq_ex.png`    | 275 × 82  | Extended EQ sprites (alt UI bits)                  |
| `pledit.png`   | 280 × 186 | Playlist editor chrome (titlebar, side strips, bottom, scrollbar) |
| `playpaus.png` | 42 × 9    | Small play / pause / stop status indicator         |

## Key sprite coordinates

### `main.png` — Winamp main window (275 × 116)

Used as the full background of `#winamp-chrome`. The bitmap art already
contains the gradient titlebar, "WINAMP" wordmark, recessed LCD wells,
slider grooves, transport-button up-states and the EQ / PL labels. We
overlay live controls at the canonical pixel coordinates below.

| Region                | x   | y   | w   | h  |
| --------------------- | --- | --- | --- | -- |
| Title bar             | 0   | 0   | 275 | 14 |
| Time digits area      | 48  | 26  | 63  | 13 |
| Track scroller well   | 111 | 27  | 154 | 6  |
| Visualizer well       | 24  | 43  | 76  | 16 |
| Mono / stereo indicators | 212 | 41 | 56 | 12 |
| Volume slider track   | 107 | 57  | 68  | 14 |
| Balance slider track  | 177 | 57  | 38  | 14 |
| EQ button             | 219 | 58  | 23  | 12 |
| PL button             | 242 | 58  | 23  | 12 |
| Position bar          | 16  | 72  | 248 | 10 |
| Transport row         | 16  | 88  | 115 | 18 |

### `cbuttons.png` — transport buttons (136 × 36)

5 main transport buttons (each 23 × 18) plus eject (22 × 18). Top row
(y = 0) is normal, bottom row (y = 18) is pressed.

| Button | x   | up state            | pressed state         |
| ------ | --- | ------------------- | --------------------- |
| prev   | 0   | `0px 0`             | `0px -18px`           |
| play   | 23  | `-23px 0`           | `-23px -18px`         |
| pause  | 46  | `-46px 0`           | `-46px -18px`         |
| stop   | 69  | `-69px 0`           | `-69px -18px`         |
| next   | 92  | `-92px 0`           | `-92px -18px`         |
| eject  | 115 | `-115px 0` (22 × 18) | `-115px -18px`       |

CSS targets `#audio-player-mount .player-controls .btn[data-act=…]` for
each button and uses `:active` to swap to the pressed row.

### `volume.png` — volume slider (68 × 433)

- 28 track frames stacked vertically, each 68 × 15. Frame index
  `n = round((value / max) * 27)` puts the cursor groove in the right
  pixel column.
- `background-position: 0 calc(var(--vol-frame, 14) * -15px);` selects
  the frame at runtime; the inline script in `index.html` writes
  `--vol-frame` on the `input` event (audio graph never touched).
- Cursor sprites near the bottom of the sheet:
  - Normal cursor: 14 × 11 at `(15, 422)` (use `background-position: -15px -422px`)
  - Pressed cursor: 14 × 11 at `(0, 422)` (use `background-position: 0 -422px`)

### `balance.png` — balance slider (68 × 433)

Same vertical-stack layout as volume, but the active rendered area is
38 px wide centered inside the 68 px sheet. The slider element is
38 × 14 with `background-position-x: -15px` to expose the active region.
Frame index for balance = `round(|balance| * 27)` (frame 0 is centered
"no offset").

Cursor sprites at the same `(15, 422)` / `(0, 422)` offsets as volume.

### `eqmain.png` — equalizer window (275 × 315)

- The top 116 px is the EQ window background (titlebar, preset row, dB
  scale, 10 fader tracks, curve area). Painted directly on `#winamp-eq`
  via `background-image`.
- Fader thumb sprites live below the EQ window at the canonical offsets:
  - Normal thumb: 11 × 11 at `(1, 164)` → `background-position: -1px -164px`
  - Pressed thumb: 11 × 11 at `(1, 176)` → `background-position: -1px -176px`
- 10 fader inputs (7 wired + 3 decorative) are absolutely positioned
  over the painted track area at canonical x coordinates: `78, 96, 114,
  132, 150, 168, 186, 204, 222, 240` (18 px pitch starting at x = 78,
  top y = 38, height = 63).

### `numbers.png` — time digits (99 × 13)

10 digits laid horizontally (9 × 13 each). Per-digit
`background-position: -<digit*9>px 0`. The live time string in
`#audio-player-mount [data-role="time"]` is rebuilt as a row of
`<span class="sprite-glyph sprite-number">` cells by the inline
`spriteText` `MutationObserver` in `index.html` — `audio/player.js`
remains untouched (writes plain text via `textContent`; observer
intercepts and replaces with sprite spans).

### `text.png` — bitmap font (155 × 74)

5 × 6 monospaced glyphs. Standard layout is 31 chars per row × 3 rows
(155 × 18) for the alpha + numbers + symbols block; extra rows below
hold the alt indicators. Reference for any future sprite-based rendering
of the kbps / kHz / scroller text.

### Other sheets

- `posbar.png` (307 × 10) — position-bar track strip + thumb sprite at
  the right end. Not currently overlaid (the audio module does not
  expose a seek input).
- `monoster.png` (58 × 24) — top row inactive (29 × 12 mono left + 29 × 12
  stereo right), bottom row active.
- `shufrep.png` (92 × 85) — shuffle and repeat button frames.
- `playpaus.png` (42 × 9) — small play / pause / stop status pill.

## Working files map

- Asset directory: `images/winamp-skin/base-2.91/*.png`
- CSS scope: `#winamp-stack`, `#winamp-chrome`, `#winamp-eq` in
  `styles/theme.css`. Zero CSS gradients remain inside those scopes;
  every gradient bevel is baked into the source bitmaps.
- HTML hook: `#now-playing > #winamp-stack > { #winamp-chrome,
  #winamp-eq, .wa-stack-extras }` in `index.html`.
- Frame-index hook: inline script in `index.html` sets `--vol-frame` /
  `--bal-frame` on the volume / balance inputs from their value.

## Future work (not in this run)

- Wire the position bar + `posbar.png` to a real seek input (we now
  paint the empty-track region; a thumb sprite at posbar.png x = 248
  would represent live playhead position).

## Bitmap font charmap + glyph offsets

The audio module writes plain text into the LCD, time, and readout
nodes. We must not edit `audio/*` (lock enforced by
`git diff HEAD~1 -- audio/ | wc -l == 0`), so the inline `spriteText`
IIFE in `index.html` attaches `MutationObserver`s to those nodes and
rebuilds their children as rows of `<span class="sprite-glyph">` backed
by the bitmap fonts. Observers self-disconnect around their own writes
to avoid feedback loops.

### `numbers.png` digit table (99 × 13)

10 digits laid horizontally, each glyph 9 × 13. CSS background offset
per digit is `-d*9px 0`.

| Digit | x   | y | w | h  | `background-position` |
| ----- | --- | - | - | -- | --------------------- |
| 0     | 0   | 0 | 9 | 13 | `0 0`                 |
| 1     | 9   | 0 | 9 | 13 | `-9px 0`              |
| 2     | 18  | 0 | 9 | 13 | `-18px 0`             |
| 3     | 27  | 0 | 9 | 13 | `-27px 0`             |
| 4     | 36  | 0 | 9 | 13 | `-36px 0`             |
| 5     | 45  | 0 | 9 | 13 | `-45px 0`             |
| 6     | 54  | 0 | 9 | 13 | `-54px 0`             |
| 7     | 63  | 0 | 9 | 13 | `-63px 0`             |
| 8     | 72  | 0 | 9 | 13 | `-72px 0`             |
| 9     | 81  | 0 | 9 | 13 | `-81px 0`             |

Extras inside `numbers.png`:

- `MINUS_SIGN` — 5 × 1 strip at (20, 6). Used by Webamp for negative
  countdown; we do not render it.
- `NO_MINUS_SIGN` — 5 × 1 blank at (9, 6).

There is **no colon glyph** in `numbers.png`. The time renderer in
`index.html` therefore emits a `:` glyph from `text.png` between the
minute and second digits, vertically centered in the 13 px digit row
via `.sprite-time-colon { margin-top: 3px; margin-bottom: 4px; }`.

### `text.png` 93-char ASCII charmap (155 × 74)

5 × 6 cells. Layout is 31 chars per row × N rows, replicated verbatim
from `webamp/packages/webamp/js/skinSprites.ts` (`FONT_LOOKUP`). Maps
each character to `[row, col]`; CSS background offset per glyph is
`-(col*5)px -(row*6)px`. The font is uppercase-only — lowercase keys
share their uppercase art (Webamp's lookup deburrs accents and
lowercases the input).

Row 0 (y = 0):

| col | char | col | char | col | char | col | char |
| --- | ---- | --- | ---- | --- | ---- | --- | ---- |
| 0   | A    | 8   | I    | 16  | Q    | 24  | Y    |
| 1   | B    | 9   | J    | 17  | R    | 25  | Z    |
| 2   | C    | 10  | K    | 18  | S    | 26  | "    |
| 3   | D    | 11  | L    | 19  | T    | 27  | @    |
| 4   | E    | 12  | M    | 20  | U    | 28  | (unused) |
| 5   | F    | 13  | N    | 21  | V    | 29  | (unused) |
| 6   | G    | 14  | O    | 22  | W    | 30  | (space) |
| 7   | H    | 15  | P    | 23  | X    |     |      |

Row 1 (y = 6):

| col | char | col | char | col | char | col | char |
| --- | ---- | --- | ---- | --- | ---- | --- | ---- |
| 0   | 0    | 8   | 8    | 16  | '    | 24  | ^    |
| 1   | 1    | 9   | 9    | 17  | !    | 25  | &    |
| 2   | 2    | 10  | …    | 18  | _    | 26  | %    |
| 3   | 3    | 11  | .    | 19  | +    | 27  | ,    |
| 4   | 4    | 12  | :    | 20  | \    | 28  | =    |
| 5   | 5    | 13  | (    | 21  | /    | 29  | $    |
| 6   | 6    | 14  | )    | 22  | [    | 30  | #    |
| 7   | 7    | 15  | -    | 23  | ]    |     |      |

Row 2 (y = 12) — ISO-Latin extras + symbols:

| col | char | col | char |
| --- | ---- | --- | ---- |
| 0   | Å    | 3   | ?    |
| 1   | Ö    | 4   | *    |
| 2   | Ä    |     |      |

Aliases (re-using existing glyphs):

- `<`, `{` → row 1 col 22 (the `[` glyph)
- `>`, `}` → row 1 col 23 (the `]` glyph)

Cell dims: `5 × 6`. Sheet dims: `155 × 74` (declared `background-size`).

### Main-window time readout

The black LCD time well on `main.png` lives at canonical
`(48, 26, 63, 13)` inside `#winamp-chrome` — measured against
`sips`-verified `main.png` (`275 × 13`) and confirmed pixel-by-pixel
against the recess in the gradient bake. The wrapper element
`[data-role="time"]` (emitted by `audio/player.js` inside its
generated `<div class="mono dim">` container) is positioned absolute
at exactly that rect. The parent `.mono.dim` wrapper is reset to
`position: static` inside the chrome scope so the time wrapper's
absolute coords resolve against `.audio-mount` / `#audio-player-mount`
(the `275 × 116` chrome coordinate space) rather than the inline-flow
parent. Without that reset, the time digits double-offset by the
parent's left/top and land outside the LCD well.

| element                  | left | top | w  | h  | source             |
| ------------------------ | ---- | --- | -- | -- | ------------------ |
| LCD time well (recessed) | 48   | 26  | 63 | 13 | `main.png` bake    |
| `[data-role="time"]`     | 48   | 26  | 63 | 13 | wraps digit spans  |
| `MM` digits              | 48   | 26  | 18 | 13 | 2 × `sprite-number` (9 × 13) from `numbers.png` |
| `:` colon glyph          | 66   | 26  |  5 | 13 | `sprite-time-colon` from `text.png` (vertical-centered via 3 / 4 px margin) |
| `SS` digits              | 71   | 26  | 18 | 13 | 2 × `sprite-number` (9 × 13) from `numbers.png` |

`numbers.png` is `99 × 13` — verified via
`sips -g pixelWidth -g pixelHeight` — with 10 digits packed at
`x = 0, 9, 18, ..., 81`. There is no colon glyph in `numbers.png`
(the cell at `x = 90` is the blank/`NO_MINUS_SIGN` `5 × 1` strip at
`y = 6`); the time renderer therefore emits a `:` from `text.png`
between the minute and second digits and centers it vertically in
the 13 px digit row via `.sprite-time-colon { margin-top: 3px;
margin-bottom: 4px; }`.

The CSS rule lives at `#winamp-chrome [data-role="time"]` (and the
more-specific `#winamp-chrome #audio-player-mount [data-role="time"]`
for resilience against DOM relocations). It only positions the
wrapper — the per-digit `background-position` writes happen inline
inside `makeNumberGlyph` in the `spriteText` IIFE so each digit picks
up its `-d * 9px 0` offset without needing a static rule per digit.

### Track-scroller marquee

The audio module writes the track title via `textContent` on
`span[data-role=lcd]`. The observer rebuilds the span as a row of
text.png glyphs. A separate `requestAnimationFrame` loop in the same
IIFE shifts the span's `transform: translateX(...)` left at ~30 px / s
and wraps once the glyph row scrolls fully past the 154 px LCD slot.
The base `.lcd-scroll span` keyframe animation is overridden inside
the chrome scope (and zeroed out for `.sprite-glyph` descendants
globally) so it cannot fight the rAF marquee or scroll our glyph
spans.

### Title-bar wordmark

The `WINAMP` wordmark is baked into the active titlebar strip in
`titlebar.png` (`sx = 27, sy = 0, 275 × 14`) which `.wa-titlebar`
paints as its background-image. No `.wa-wordmark` overlay element is
created — an earlier pass injected one and rebuilt it as `text.png`
glyphs via the `spriteText` observer, but that overlay leaked the
inherited theme accent color (green VT323 "WINAMP" text) on top of
the otherwise pixel-correct sprite. Dropping the JS injection lets
the titlebar.png bake show through cleanly. The orphan
`#winamp-chrome .wa-titlebar > .wa-wordmark` rule remains in
`theme.css` as a no-op (no element matches) and is harmless.

There is no dedicated lightning-bolt sprite in the active strip
itself (only the "Easter egg" titlebar variants at `y = 57 / 72`
contain bolt art baked into the gradient); the bolt is overlaid
separately as `.wa-bolt` from the top-left `9 × 9` sprite cell of
`titlebar.png`.

## Clutter button states

### Title-bar OAIDV cluster (overlay on `main.png`, sprites from `titlebar.png`)

`main.png` paints the inactive O / A / I / D / V column at canonical
(10, 22, 8, 43). Five 1 × 1 hit-target spans inside
`#winamp-chrome .wa-clutter-vbar` overlay it and swap to the SELECTED
sprite from `titlebar.png` on `:active`. Coordinates per
`webamp/css/main-window.css` + `skinSprites.ts`:

| Button | overlay top | overlay h | sprite x | sprite y | sprite w × h |
| ------ | ----------- | --------- | -------- | -------- | ------------ |
| O      | 3           | 8         | 304      | 47       | 8 × 8        |
| A      | 11          | 7         | 312      | 55       | 8 × 7        |
| I      | 18          | 7         | 320      | 62       | 8 × 7        |
| D      | 25          | 8         | 328      | 69       | 8 × 8        |
| V      | 33          | 7         | 336      | 77       | 8 × 7        |

Sheet dims: `344 × 87`.

### Lower-right EQ / PL cluster (sprites from `shufrep.png`)

Sheet dims: `92 × 85`. Each button is 23 × 12 with four states (normal,
depressed, selected, selected + depressed). `aria-pressed="true"`
selects the lit (bottom) row; `:active` selects the pressed (right)
column.

| Button | normal      | depressed     | selected     | sel + depressed |
| ------ | ----------- | ------------- | ------------ | --------------- |
| EQ     | `(0, 61)`   | `(46, 61)`    | `(0, 73)`    | `(46, 73)`      |
| PL     | `(23, 61)`  | `(69, 61)`    | `(23, 73)`   | `(69, 73)`      |

Wiring lives in the existing inline IIFE in `index.html` that flips
`aria-pressed` on click — no `audio/*` edits needed.

## monoster overlay coords

`monoster.png` is 58 × 24 with two indicator pairs side by side:

| Sprite             | x  | y  | w  | h  |
| ------------------ | -- | -- | -- | -- |
| `STEREO_SELECTED`  | 0  | 0  | 29 | 12 |
| `MONO_SELECTED`    | 29 | 0  | 27 | 12 |
| `STEREO`           | 0  | 12 | 29 | 12 |
| `MONO`             | 29 | 12 | 27 | 12 |

Overlay element `.wa-monoster` lives at canonical (212, 41, 56, 12)
inside `#winamp-chrome`. The base background paints the left "stereo"
half; `::after` paints the right "mono" half. `data-mode` toggles which
half is lit:

- `data-mode="stereo"` — left = `(0, 0)` (lit stereo), right = `(29, 12)` (dim mono)
- `data-mode="mono"`   — left = `(0, 12)` (dim stereo), right = `(29, 0)` (lit mono)

The sprite-text observer reads `.wa-channels`'s text node (audio module
writes "stereo" or "mono") and writes `monosterEl.dataset.mode`
accordingly. The `.wa-channels` text element itself is
`visibility: hidden` so only the sprite indicator renders.

## posbar empty-state crop

`posbar.png` is 307 × 10 — a 248 × 10 empty-track strip on the left
followed by two 29 × 10 thumb sprites (normal + selected) on the right.
`main.png` paints a default position-bar art at (16, 72, 248, 10) that
includes a thumb mid-track, leaving an orange band visible because the
audio module exposes no seek input. We overlay `.wa-posbar` cropped to
the empty-track region:

| Region              | x  | y | w   | h  | bg-position |
| ------------------- | -- | - | --- | -- | ----------- |
| Empty-track sprite  | 0  | 0 | 248 | 10 | `0 0`       |
| Overlay placement   | 16 | 72 | 248 | 10 | (inside `#winamp-chrome`) |

`background-size: 307px 10px` keeps the thumb sprite at x = 248 fully
off-screen so no thumb is rendered.

## EQ window — base 2.91

The equalizer window (`#winamp-eq`) renders as a 275 × 116 sprite-backed
panel sitting directly underneath `#winamp-chrome` inside `#winamp-stack`
with no gap and no flex container — vanilla block stacking at 275 px
width. The full EQ window background (titlebar + ON / AUTO band, EQ graph
well, dB scale, 10 fader grooves) is painted from `eqmain.png` on the
`#winamp-eq` element via `background-image` + `background-position: 0 0`
+ `background-size: 275px 315px` and `image-rendering: pixelated`.

Sprite coordinates are taken from the captbaritone/webamp checked-in
`packages/webamp/js/skinSprites.ts` (`EQMAIN`) and on-window placement
from `packages/webamp/css/equalizer-window.css` — NOT from
`skins.webamp.org` derivatives. Sheet `eqmain.png` is `275 × 315`
(8-bit colormap PNG), verified in the existing inventory table above.

### Sprites used (sheet: `eqmain.png` 275 × 315)

| Sprite                              | sx  | sy  | w   | h  |
| ----------------------------------- | --- | --- | --- | -- |
| `EQ_WINDOW_BACKGROUND`              | 0   | 0   | 275 | 116 |
| `EQ_TITLE_BAR_SELECTED` (active)    | 0   | 134 | 275 | 14 |
| `EQ_TITLE_BAR` (inactive)           | 0   | 149 | 275 | 14 |
| `EQ_CLOSE_BUTTON`                   | 0   | 116 | 9   | 9  |
| `EQ_CLOSE_BUTTON_ACTIVE`            | 0   | 125 | 9   | 9  |
| `EQ_ON_BUTTON`                      | 10  | 119 | 26  | 12 |
| `EQ_ON_BUTTON_DEPRESSED`            | 128 | 119 | 26  | 12 |
| `EQ_ON_BUTTON_SELECTED`             | 69  | 119 | 26  | 12 |
| `EQ_ON_BUTTON_SELECTED_DEPRESSED`   | 187 | 119 | 26  | 12 |
| `EQ_AUTO_BUTTON`                    | 36  | 119 | 32  | 12 |
| `EQ_AUTO_BUTTON_DEPRESSED`          | 154 | 119 | 32  | 12 |
| `EQ_AUTO_BUTTON_SELECTED`           | 95  | 119 | 32  | 12 |
| `EQ_AUTO_BUTTON_SELECTED_DEPRESSED` | 213 | 119 | 32  | 12 |
| `EQ_PRESETS_BUTTON`                 | 224 | 164 | 44  | 12 |
| `EQ_PRESETS_BUTTON_SELECTED`        | 224 | 176 | 44  | 12 |
| `EQ_GRAPH_BACKGROUND`               | 0   | 294 | 113 | 19 |
| `EQ_SLIDER_THUMB`                   | 0   | 164 | 11  | 11 |
| `EQ_SLIDER_THUMB_SELECTED`          | 0   | 176 | 11  | 11 |

### On-window placement

Origin (0, 0) is the top-left pixel of `#winamp-eq`. All overlay
elements are absolutely positioned at the canonical Webamp coordinates
from `equalizer-window.css`:

| Element                       | left | top | w   | h  | DOM class             |
| ----------------------------- | ---- | --- | --- | -- | --------------------- |
| Titlebar strip                | 0    | 0   | 275 | 14 | `.eq-titlebar`        |
| Close button                  | 264  | 3   | 9   | 9  | `.eq-titlebar-close`  |
| ON button                     | 14   | 18  | 26  | 12 | `.eq-on`              |
| AUTO button                   | 40   | 18  | 32  | 12 | `.eq-auto`            |
| PRESETS button                | 217  | 18  | 44  | 12 | `.eq-presets-btn`     |
| EQ graph well (decorative)    | 86   | 17  | 113 | 19 | `.eq-graph`           |
| Preamp slider (decorative)    | 21   | 38  | 14  | 63 | `.eq-preamp`          |
| Band 60                       | 78   | 38  | 14  | 63 | `.eq-fader` 1st       |
| Band 170                      | 96   | 38  | 14  | 63 | `.eq-fader` 2nd       |
| Band 310                      | 114  | 38  | 14  | 63 | `.eq-fader` 3rd       |
| Band 600                      | 132  | 38  | 14  | 63 | `.eq-fader` 4th       |
| Band 1000                     | 150  | 38  | 14  | 63 | `.eq-fader` 5th       |
| Band 3000                     | 168  | 38  | 14  | 63 | `.eq-fader` 6th       |
| Band 6000                     | 186  | 38  | 14  | 63 | `.eq-fader` 7th       |
| Band 12000                    | 204  | 38  | 14  | 63 | `.eq-faders-decor` 1st |
| Band 14000                    | 222  | 38  | 14  | 63 | `.eq-faders-decor` 2nd |
| Band 16000                    | 240  | 38  | 14  | 63 | `.eq-faders-decor` 3rd |

Bands 1 – 7 are wired through `audio/eq-mixer.js` `familyGain` nodes
(rendered by `renderMixerUI` once the audio context boots on first
play). Bands 8 – 10 are decorative overlays only — neither they nor the
preamp connect to any audio node. Per the project lock the audio graph
is frozen (no biquad EQ filters); "EQ" colour comes from the 7-family
PRESETS table below applied to the `familyGain` fan-in.

### Sprite-state truth table for ON / AUTO / PRESETS

ON and AUTO buttons each have four sprites (normal, depressed, selected,
selected-depressed). `aria-pressed="true"` selects the lit (selected)
row; `:active` selects the pressed (depressed) column. PRESETS only has
two sprites; the SELECTED variant paints while the dropdown is open
(`aria-expanded="true"`) and on `:active`.

| State                                | ON sprite          | AUTO sprite        |
| ------------------------------------ | ------------------ | ------------------ |
| `aria-pressed="false"`               | `(10, 119)`        | `(36, 119)`        |
| `aria-pressed="false"` + `:active`   | `(128, 119)`       | `(154, 119)`       |
| `aria-pressed="true"`                | `(69, 119)`        | `(95, 119)`        |
| `aria-pressed="true"` + `:active`    | `(187, 119)`       | `(213, 119)`       |

| State                                | PRESETS sprite     |
| ------------------------------------ | ------------------ |
| default                              | `(224, 164)`       |
| `aria-expanded="true"` or `:active`  | `(224, 176)`       |

### Active vs inactive titlebar

The EQ window background already bakes the active titlebar variant into
the top 14 px of `EQ_WINDOW_BACKGROUND`. We additionally paint a
`.eq-titlebar` strip from `EQ_TITLE_BAR_SELECTED` (`0, 134`) so a
later/blur-based class swap to `.is-inactive` (`background-position: 0
-149px`, the `EQ_TITLE_BAR` sprite) flips the chrome without repainting
the entire window background. The inline EQ-window IIFE in `index.html`
toggles `.is-inactive` on `window.blur` and clears it on `window.focus`
via `document.hasFocus()`.

## Preset → family gain mapping

The PRESETS dropdown in `#winamp-eq` ramps the 7 `familyGain.gain.value`
nodes (created in `audio/eq-mixer.js` `createMixer`) to the table below
via `linearRampToValueAtTime` over 80 ms. `cancelScheduledValues` runs
first so rapid preset cycling never queues a stack of pending ramps and
never freezes the audio thread (verified: clicking through all 7 presets
in < 2 s leaves the tab responsive).

Family order is the canonical `FAMILY_ORDER` exported by
`audio/eq-mixer.js`: `['guitars', 'strings', 'bass', 'pads', 'leads',
'perc', 'other']`. Values are linear gain multipliers in `[0, 1.5]`
(matching the `G_MIN` / `G_MAX` clamp inside `eq-mixer.js`).

| Preset       | guitars | strings | bass | pads | leads | perc | other |
| ------------ | ------- | ------- | ---- | ---- | ----- | ---- | ----- |
| Flat         | 1.00    | 1.00    | 1.00 | 1.00 | 1.00  | 1.00 | 1.00  |
| Rock         | 1.20    | 0.95    | 1.30 | 0.85 | 1.10  | 1.20 | 1.00  |
| Pop          | 1.00    | 1.05    | 1.10 | 1.05 | 1.20  | 1.10 | 1.00  |
| Vocal        | 0.85    | 1.10    | 0.80 | 0.90 | 1.30  | 0.95 | 1.05  |
| Bass-Heavy   | 1.10    | 0.85    | 1.40 | 1.10 | 0.85  | 1.10 | 0.90  |
| Treble-Heavy | 0.95    | 1.20    | 0.80 | 0.95 | 1.30  | 1.20 | 1.05  |
| Classical    | 0.85    | 1.30    | 0.90 | 1.20 | 0.85  | 0.90 | 1.05  |

ON toggle behaviour: when `aria-pressed="false"` the IIFE ramps every
family gain to flat (`1.0`) so the per-family fan-in is audibly
identity (bypass). Re-enabling restores `lastPreset` from
`localStorage.eq_preset`. The 10 fader inputs keep rendering at their
last user-set positions either way; they are decorative overlays on top
of family gain (no biquad filters).

The audio graph is reached via `window.__dadePlayer.mixer.familyGains`
(a `Map` of family-name → `GainNode`), captured from the `initPlayer`
return value in `index.html`. `audio/*` is byte-identical to HEAD~0
across this run — verified with `git diff HEAD~1 -- audio/ | wc -l`
returning `0`.

## DOM changes

- Removed `.wa-stack-extras` and its sole child `#dade-sfx-toggle`
  from inside `#winamp-stack` (was sitting below `#winamp-eq`).
- Re-inserted the same `<span id="dade-sfx-toggle" class="btn"
  role="button" tabindex="0">` byte-identically inside the right
  sidebar's `#fx-toggles-mount` widget as a third sibling button after
  `#toggle-crt` and `#toggle-stars`. The inline wiring (and
  `audio/sfx.js`'s shared `localStorage.sfx_enabled` key) keeps working
  unchanged because the id, class, and behaviour are preserved.
- Added decorative chrome inside `#winamp-chrome`: `.wa-clutter-vbar`
  (5 OAIDV hit-targets), `.wa-posbar` (empty position-bar cover), and
  `.wa-monoster` (mono / stereo sprite overlay).
- Added `.wa-wordmark` child to `.wa-titlebar`, populated with text.png
  glyphs by the sprite-text observer.
- Added `.wa-bolt`, `.wa-title[data-role="drag-handle"]`, and three
  sprite-only buttons (`.wa-min`, `.wa-shade`, `.wa-close`) inside
  `.wa-titlebar` for pixel-perfect titlebar parity with Base 2.91. No
  click handlers wired this run — buttons render their pressed sprite
  on `:active` only. Drag, windowshade, and close behaviours land in
  later replica-sequence steps.

## Titlebar element offsets

Sheet: `images/winamp-skin/base-2.91/titlebar.png` — verified `344 × 87`
(8-bit colormap PNG). The top-left `27 × 27` block holds the bolt and
the min / shade / close cluster in three 9 × 9 columns × three 9-tall
rows. The two long horizontal strips at `sx = 27` are the active
(`sy = 0`) and inactive (`sy = 15`) titlebar backgrounds; both are
`275 × 14`. Verified by visual inspection of a 4× upscale of the sheet —
all rects below match the canonical Webamp / Winamp 2.x sprite map.

| element  | state    | sx | sy | w   | h  | draw-x-on-main | draw-y-on-main |
| -------- | -------- | -- | -- | --- | -- | -------------- | -------------- |
| strip    | active   | 27 |  0 | 275 | 14 |   0            |   0            |
| strip    | inactive | 27 | 15 | 275 | 14 |   0            |   0            |
| bolt     | active   |  0 |  0 |   9 |  9 |   6            |   3            |
| bolt     | inactive |  0 |  9 |   9 |  9 |   6            |   3            |
| minimize | normal   |  9 |  0 |   9 |  9 | 244            |   3            |
| minimize | pressed  |  9 |  9 |   9 |  9 | 244            |   3            |
| shade    | normal   |  0 | 18 |   9 |  9 | 254            |   3            |
| shade    | pressed  |  9 | 18 |   9 |  9 | 254            |   3            |
| close    | normal   | 18 |  0 |   9 |  9 | 264            |   3            |
| close    | pressed  | 18 |  9 |   9 |  9 | 264            |   3            |

The drag-handle region (`.wa-title[data-role="drag-handle"]`) is the
strip area between the bolt's right edge and the minimize button —
left = 16, top = 3, width = 224, height = 9 inside `#winamp-chrome` —
marked with `cursor: move` only; no drag wiring this run.

## Window shade offsets (Step 6)

Canonical shade-mode coordinates used by this repo. Main-window shaded
art and mini controls are sourced from `titlebar.png` (`344 × 87`).
EQ and playlist shaded strips live in `eq_ex.png` / `pledit.png`
(Winamp's stock sheet layout), but are listed here for one-stop shade
lookup.

### Main shade strip + mini controls (`titlebar.png`)

| Sprite                                | sx  | sy  | w   | h  | Notes |
| ------------------------------------- | --- | --- | --- | -- | ----- |
| Main shaded strip (selected/active)   | 27  | 29  | 275 | 14 | `#winamp-chrome.shaded` base strip |
| Main shaded strip (inactive)          | 27  | 42  | 275 | 14 | future blur/focus swap |
| Shade button selected                 | 0   | 27  | 9   | 9  | shown while window is shaded |
| Shade button selected + pressed       | 9   | 27  | 9   | 9  | active click frame |
| Mini prev button                      | 196 | 29  | 7   | 10 | draw at `(169, 2)` in shaded window |
| Mini play button                      | 203 | 29  | 10  | 10 | draw at `(176, 2)` |
| Mini pause button                     | 213 | 29  | 9   | 10 | draw at `(186, 2)` |
| Mini stop button                      | 222 | 29  | 9   | 10 | draw at `(195, 2)` |
| Mini next button                      | 231 | 29  | 10  | 10 | draw at `(204, 2)` |
| Mini viz well region                  | 106 | 34  | 38  | 5  | draw at `(79, 5)` |

### EQ shade strip + glyph anchors

Source sheet: `eq_ex.png` (`275 × 82`).

| Sprite                              | sx | sy | w   | h  | Notes |
| ----------------------------------- | -- | -- | --- | -- | ----- |
| EQ shaded strip selected            | 0  | 0  | 275 | 14 | `#winamp-eq.shaded` base strip |
| EQ shaded strip inactive            | 0  | 15 | 275 | 14 | optional focus swap |
| EQ maximize glyph (shaded->full)    | 1  | 38 | 9   | 9  | shade button in shaded mode |
| EQ minimize glyph (full->shaded)    | 1  | 47 | 9   | 9  | shade button in full mode |
| EQ shaded close glyph               | 11 | 38 | 9   | 9  | existing close slot |

### Playlist shade strip + title row

Source sheet: `pledit.png` (`280 × 186`).

| Sprite                                   | sx  | sy | w  | h  | Notes |
| ---------------------------------------- | --- | -- | -- | -- | ----- |
| Playlist shade background tile           | 72  | 57 | 25 | 14 | body tile used across strip |
| Playlist shade background left cap       | 72  | 42 | 25 | 14 | left edge |
| Playlist shade background right selected | 99  | 42 | 50 | 14 | right edge (active) |
| Playlist collapse glyph (full->shaded)   | 62  | 42 | 9  | 9  | titlebar shade button |
| Playlist expand glyph (shaded->full)     | 150 | 42 | 9  | 9  | titlebar shade button when shaded |

## Playlist window — base 2.91

The playlist window (`#winamp-pl`) renders as a 275 × 232 sprite-backed
panel sitting directly underneath `#winamp-eq` inside `#winamp-stack`,
with no gap and no flex container — vanilla block stacking at 275 px
width. All chrome paints from `pledit.png` (280 × 186) and
`shufrep.png` (92 × 85). Sprite coordinates are taken from the
captbaritone/webamp checked-in `packages/webamp/js/skinSprites.ts`
(`PLEDIT` + `SHUFREP` blocks) and on-window placement from
`packages/webamp/css/playlist-window.css` default 275 × 232 layout —
NOT from `skins.webamp.org` derivatives. Sheet `pledit.png` is
`280 × 186` and `shufrep.png` is `92 × 85` (8-bit colormap PNG, both
verified via `file`).

### Sprites used (sheet: `pledit.png` 280 × 186)

| Sprite                                 | sx  | sy  | w   | h  |
| -------------------------------------- | --- | --- | --- | -- |
| `PLAYLIST_TOP_LEFT_SELECTED`           | 0   | 0   | 25  | 20 |
| `PLAYLIST_TITLE_BAR_SELECTED`          | 26  | 0   | 100 | 20 |
| `PLAYLIST_TOP_TILE_SELECTED`           | 127 | 0   | 25  | 20 |
| `PLAYLIST_TOP_RIGHT_CORNER_SELECTED`   | 153 | 0   | 25  | 20 |
| `PLAYLIST_TOP_LEFT_CORNER` (inactive)  | 0   | 21  | 25  | 20 |
| `PLAYLIST_TITLE_BAR`     (inactive)    | 26  | 21  | 100 | 20 |
| `PLAYLIST_TOP_TILE`      (inactive)    | 127 | 21  | 25  | 20 |
| `PLAYLIST_TOP_RIGHT_CORNER` (inactive) | 153 | 21  | 25  | 20 |
| `PLAYLIST_LEFT_TILE`                   | 0   | 42  | 12  | 29 |
| `PLAYLIST_RIGHT_TILE`                  | 31  | 42  | 20  | 29 |
| `PLAYLIST_BOTTOM_LEFT_CORNER`          | 0   | 72  | 125 | 38 |
| `PLAYLIST_BOTTOM_RIGHT_CORNER`         | 126 | 72  | 150 | 38 |
| `PLAYLIST_SCROLL_HANDLE`               | 52  | 53  | 8   | 18 |
| `PLAYLIST_SCROLL_HANDLE_SELECTED`      | 61  | 53  | 8   | 18 |
| `PLAYLIST_CLOSE_SELECTED`              | 52  | 42  | 9   | 9  |

Inactive titlebar sprites (rows at `sy = 21`) are reserved for a future
focus / blur swap on `.pl-titlebar.is-inactive`; the active row is
painted in this run because the playlist always sits inside the focused
homepage chrome (the page does not lose focus while the widget is
visible during normal browsing).

### Sprites used (sheet: `shufrep.png` 92 × 85)

`MAIN_REPEAT_BUTTON` family (28 × 15) and `MAIN_SHUFFLE_BUTTON` family
(47 × 15). Both buttons are 15 px tall — NOT 12 px like the EQ / PL
clutter further down the same sheet.

| State                                  | REPEAT sprite | SHUFFLE sprite |
| -------------------------------------- | ------------- | -------------- |
| normal                                 | `(0, 0)`      | `(28, 0)`      |
| `:active` (depressed)                  | `(0, 15)`     | `(28, 15)`     |
| `aria-pressed="true"` (selected)       | `(0, 30)`     | `(28, 30)`     |
| `aria-pressed="true"` + `:active`      | `(0, 45)`     | `(28, 45)`     |

### On-window placement

Origin (0, 0) is the top-left pixel of `#winamp-pl`. All overlay
elements are absolutely positioned at the canonical Webamp coordinates
from `playlist-window.css` (default 275-wide layout):

| Element              | left | top | w   | h   | DOM class                  |
| -------------------- | ---- | --- | --- | --- | -------------------------- |
| Titlebar strip       | 0    | 0   | 275 | 20  | `.pl-titlebar`             |
| Titlebar close       | 263  | 3   | 9   | 9   | `.pl-titlebar-close`       |
| Title bar (centered) | 87   | 0   | 100 | 20  | `.pl-tb-title-mid`         |
| Top-left corner      | 0    | 0   | 25  | 20  | `.pl-tb-corner-l`          |
| Top-right corner     | 250  | 0   | 25  | 20  | `.pl-tb-corner-r`          |
| Top tile fill (L)    | 25   | 0   | 62  | 20  | `.pl-tb-fill[data-side=l]` |
| Top tile fill (R)    | 187  | 0   | 63  | 20  | `.pl-tb-fill[data-side=r]` |
| Left side strip      | 0    | 20  | 12  | 174 | `.pl-side-l`               |
| Right side strip     | 255  | 20  | 20  | 174 | `.pl-side-r`               |
| List area            | 12   | 23  | 243 | 168 | `.pl-list`                 |
| Scrollbar slot       | 260  | 23  | 8   | 168 | `.pl-scrollbar`            |
| Scrollbar thumb      | 260  | 23+ | 8   | 18  | `.pl-scroll-thumb`         |
| Bottom strip (L)     | 0    | 194 | 125 | 38  | `.pl-bottom-l`             |
| Bottom strip (R)     | 125  | 194 | 150 | 38  | `.pl-bottom-r`             |
| SHUFFLE              | 164  | 209 | 47  | 15  | `.pl-shuffle`              |
| REPEAT               | 212  | 209 | 28  | 15  | `.pl-repeat`               |
| Track count          | 8    | 213 | -   | 6   | `.pl-track-count`          |
| Time display         | 96   | 213 | -   | 6   | `.pl-time-display`         |

Title centering: at the canonical 275 width the webamp flex layout
resolves to `25 + 50 + 12 + 100 + 13 + 50 + 25 = 275`. Our DOM avoids
flex and instead positions the 100-wide title sprite at `x = 87`, with
two `overflow:hidden` fill cells (62 px on the left, 63 px on the
right) covering the gaps. The 1 px asymmetry between the two fills is
invisible at 1× zoom; a flex implementation would round to the same
visual result.

### Tile-fill technique (no CSS gradients, no whole-sheet repeats)

The titlebar gap fills (62 / 63 px wide) and the side strips (174 tall)
need to repeat a single 25 × 20 / 12 × 29 / 20 × 29 sprite without
exposing other sprites that share columns / rows on the source sheet.
Repeating the entire 280 × 186 sheet via `background-repeat` would
surface adjacent sprite art (e.g. column 0..12 of `pledit.png` contains
the bottom-left corner art at `y = 72..110` and the ADD URL button at
`y = 111..129` on top of the left tile at `y = 42..70`).

The fix is to wrap each region in an `overflow: hidden` parent and
stack N inline-block / block child `<i>` cells, each cell sized to
exactly one tile worth of pixels with `background-position` selecting
just that tile. The last cell is clipped by the parent box. This keeps
every painted pixel inside the desired sprite and preserves bit-for-bit
fidelity at 1× zoom.

### Behaviour wiring

- Row text rendered through `window.__waRenderText` (text.png 5 × 6).
- Time + track count rendered through the same helper so the bottom
  strip stays in the same monospace 5 × 6 sprite font.
- Double-click on `.pl-row` calls
  `window.__dadePlayer.setTrackIndex(idx, true)` — the public setter
  exposed on the player handle and the same code path the audio
  module's own `next()` and `prev()` handlers go through. The audio
  graph is reached without any edit to `audio/*` (the public handle is
  captured in the inline module script via the existing
  `window.__dadePlayer = initPlayer(...)` line).
- SHUFFLE intercepts user clicks on `[data-act="next"]` inside
  `#audio-player-mount` and re-routes to a random unplayed index by
  calling `setTrackIndex(pick, true)` after the audio module's own
  `next()` call. The second call wins; `pendingTrack` inside
  `loadTrack` drops the in-flight first load cleanly.
- REPEAT toggle persists in `localStorage.pl_repeat` and SHUFFLE in
  `localStorage.pl_shuffle`. Auto-advance behaviour is now functional
  via a **capture-phase `ended` shim** installed at the chrome layer on
  the `<audio>` element inside `#audio-player-mount` (see
  `installPlEndedShim` IIFE in `index.html`). The shim runs before the
  audio module's own bubble-phase `ended` listener and uses
  `stopImmediatePropagation()` to suppress the internal mod-N wrap on
  two paths:
  - **REPEAT off + last track**: shim calls `audio.pause()` and stops
    propagation, so playback halts at the end of the final track instead
    of wrapping to track 0 (matches native Winamp behaviour).
  - **SHUFFLE on**: shim picks a random index `!= current` from `TRACKS`,
    calls `window.__dadePlayer.setTrackIndex(pick, true)`, and stops
    propagation so the auto-advance lands on a random track instead of
    `(current + 1) % N`.
  - **REPEAT on, non-last track, or SHUFFLE off**: shim is a no-op; the
    audio module's existing handler runs and wraps mod-N as before.
  Current index is resolved via `window.__dadePlayer.getTrackIndex()` /
  `.trackIndex` if the handle exposes them, otherwise by matching
  `audio.currentSrc` against `TRACKS[i].src`. The shim is double-install
  guarded via `audio.__plEndedShimInstalled = true` and the audio graph
  is byte-identical: only `audio.pause()` and the existing public
  `setTrackIndex()` setter are called — no edits under `audio/*`.
- Scrollbar thumb is functional via mousedown / mousemove on the thumb
  span. The list scrolls via `transform: translateY(-scrollY)` on
  `.pl-list-inner` so the native browser scrollbar never appears, and
  the thumb position is a linear function of `scrollY / maxScroll`.
- Time display is fed by an `rAF` poll that reads `__lastRawText` off
  the audio module's `[data-role="time"]` node (set by the existing
  spriteText IIFE's observer when `audio/player.js` writes
  `textContent` each frame). The diff-guard re-renders glyphs only
  when the visible second changes. **No new MutationObservers are
  created** for the playlist scope, so the existing observer guards
  (`attachAll` idempotency, EQ-fader guard, LCD glyph guard) remain
  byte-identical.

## Visualizer well — `#wa-viz` canvas

- **Canonical coords**: 76 x 16 pixel well at **(24, 43)** inside the
  275 x 116 main window (`main.png` background origin). Sits between the
  play/pause/stop sprite stack on the left and the LCD readout / time
  digits on the right. These are the same coordinates Webamp uses
  (see `captbaritone/webamp` `js/components/Vis/`) and match every
  classic .wsz skin since Winamp 2.
- The canvas is added once inside `#winamp-chrome` as
  `<canvas id="wa-viz" width="76" height="16">` with the backing store
  sized 1:1 to the on-screen box. CSS sets `image-rendering: pixelated`
  defensively so non-integer DPR or browser zoom never bilinear-smooths
  the output. **No CSS gradients** anywhere in the chrome scope — every
  colour is a flat `fillRect` from the viscolor palette.
- Click the canvas to cycle modes: `0` off, `1` spectrum, `2`
  oscilloscope. Mode persists across reloads in
  `localStorage.wa_viz_mode` (default `'1'`).
- The render loop is a single `requestAnimationFrame` and is paused
  while `document.hidden` is true (visibilitychange listener) so the
  canvas costs zero CPU in background tabs. Init is double-install
  guarded via `canvas.__vizAttached`.

### Audio source — read-only consumer

The viz consumes `globalThis.__dadeAudioAnalyser`, the `AnalyserNode`
exposed by `audio/player.js` `ensureCtx()` on first play. The audio
graph (`masterGain -> analyser -> destination`, `fftSize: 256`) is
**not touched** by this layer — the viz only calls
`getByteFrequencyData` / `getByteTimeDomainData` on the existing node.
Diffs under `audio/` for this step are byte-identical (`git diff
HEAD~1 -- audio/ | wc -l == 0`).

### Spectrum mode (1)

- 19 bars at `BAR_W = 3px`, `BAR_GAP = 1px`, stride 4px. Total span
  `19*4 - 1 = 75px`, leaving a 1px right margin inside the 76px
  canvas (matches native Winamp 2 spacing — the canonical layout is
  3-wide bars with 1-wide gaps; the prompt's "4px wide + 1px gaps" is
  read as the 4px stride per bar).
- Frequency bins are grouped into the 19 bars using a logarithmic
  bin map built once from `analyser.frequencyBinCount` (128 with
  `fftSize: 256`). Bar 0 covers the lowest non-DC bin; bar 18 covers
  the top of the spectrum. Per-bar height is `round((avg/255) * 16)`.
- Each bar pixel row `y` (0 = top) is filled with `viscolor[2 + y]`,
  so the top row is bright red and the bottom row is dark green —
  matches native Winamp.
- Per-bar peak caps are tracked across frames; cap colour is
  `viscolor[23]` (gray) and falls 1 pixel per frame.

### Oscilloscope mode (2)

- Reads `getByteTimeDomainData` into a buffer sized to `analyser.fftSize`
  and sub-samples to 76 columns (one per pixel column). Sample value
  `v` (0..255, silence ≈ 128) maps to row `y = round((255-v)/255 *
  15)`. Adjacent columns are connected with a vertical `fillRect`
  span so the polyline reads continuously even when the waveform
  jumps more than 1px between samples.
- Colour band is keyed off the row excursion from centre:
  `band = min(4, floor(|y - 7| / 2))`, painted with
  `viscolor[18 + band]`. Centre rows render in `viscolor[18]` (white);
  peak excursions render in `viscolor[22]` (dim).

### Viscolor palette — `viscolor.txt` format + slots

- `viscolor.txt` is a plain-text file inside a Winamp `.wsz` pack with
  exactly **24 lines**, each line `"r,g,b"` (decimal 0..255, no
  quoting, no header). Some skins include trailing whitespace or
  comments after the 24 lines — readers must ignore everything after
  line 24.
- The Base 2.91 .wsz pack we slice sprites from (`images/winamp-skin/
  base-2.91/`) **does not ship a `viscolor.txt`**. The viz palette is
  therefore the canonical Webamp default 24-colour table baked inline
  into the `attachWaViz` IIFE. Slot meaning (matches Webamp source):
  - `0`     background (solid fill behind bars / between scan lines)
  - `1`     background dot / gridline (currently unused — kept for
    slot fidelity if a future skin paints scan lines)
  - `2..17` spectrum bar pixel-row colours, top → bottom
    (red → green); 16 entries map 1:1 to the 16 row slots
  - `18..22` oscilloscope amplitude bands (centre → peak excursion)
  - `23`    spectrum peak-cap colour
- If a future skin pack ships `viscolor.txt`, the parser path is:
  fetch the file, split on `\n`, take the first 24 non-empty lines,
  and for each line `match(/(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/)` →
  `[r, g, b]`. The current implementation has the slot indices and
  fill points already wired so dropping in a parsed palette is a
  single `PALETTE = parsed` swap.

### Reused vs. new viz slot

- The pre-existing `<canvas id="viz" class="wa-viz" width="280"
  height="48" hidden>` is a relic from an earlier audio-module–owned
  viz that was never sized to the sprite well. It stays hidden via
  the `#winamp-chrome .wa-viz { display: none !important; }` rule.
  This step adds a **new** `<canvas id="wa-viz">` (different id, no
  `.wa-viz` class) so the hidden rule does not apply, and positions
  it at the canonical sprite coords.

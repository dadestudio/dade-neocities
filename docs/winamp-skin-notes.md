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
| `pledit.png`   | 280 × 186 | Playlist editor chrome (not used yet)              |
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
- Skin the shuffle / repeat toggles from `shufrep.png`.

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

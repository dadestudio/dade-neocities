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

## Transport buttons (cbuttons.png)

Verified sheet dimensions:

```
$ sips -g pixelWidth -g pixelHeight images/winamp-skin/base-2.91/cbuttons.png
/Users/dade/Projects/dade-neocities/images/winamp-skin/base-2.91/cbuttons.png
  pixelWidth: 136
  pixelHeight: 36
```

Sprite map (cross-checked against `webamp/js/skinSprites.ts` `CBUTTONS`):

| sprite                       | sx  | sy | w  | h  |
| ---------------------------- | --- | -- | -- | -- |
| `MAIN_PREVIOUS_BUTTON`       |   0 |  0 | 23 | 18 |
| `MAIN_PREVIOUS_BUTTON_ACTIVE`|   0 | 18 | 23 | 18 |
| `MAIN_PLAY_BUTTON`           |  23 |  0 | 23 | 18 |
| `MAIN_PLAY_BUTTON_ACTIVE`    |  23 | 18 | 23 | 18 |
| `MAIN_PAUSE_BUTTON`          |  46 |  0 | 23 | 18 |
| `MAIN_PAUSE_BUTTON_ACTIVE`   |  46 | 18 | 23 | 18 |
| `MAIN_STOP_BUTTON`           |  69 |  0 | 23 | 18 |
| `MAIN_STOP_BUTTON_ACTIVE`    |  69 | 18 | 23 | 18 |
| `MAIN_NEXT_BUTTON`           |  92 |  0 | 23 | 18 |
| `MAIN_NEXT_BUTTON_ACTIVE`    |  92 | 18 | 22 | 18 |
| `MAIN_EJECT_BUTTON`          | 114 |  0 | 22 | 16 |
| `MAIN_EJECT_BUTTON_ACTIVE`   | 114 | 16 | 22 | 16 |

Canonical placement inside the 275 × 116 main window, derived from
`webamp/css/main-window.css` `.actions div` block + the dedicated
`#eject` rule. Eject sits 1 px lower than the prev/play/pause/stop/next
row and is 16 (not 18) px tall:

| element  | left | top | w  | h  | source                           |
| -------- | ---- | --- | -- | -- | -------------------------------- |
| prev     |  16  | 88  | 23 | 18 | `webamp .actions #previous`      |
| play     |  39  | 88  | 23 | 18 | `webamp .actions #play`          |
| pause    |  62  | 88  | 23 | 18 | `webamp .actions #pause`         |
| stop     |  85  | 88  | 23 | 18 | `webamp .actions #stop`          |
| next     | 108  | 88  | 22 | 18 | `webamp .actions #next` (w=22)   |
| eject    | 136  | 89  | 22 | 16 | `webamp #eject`                  |

The five wired transport buttons (prev / play / pause / stop / next) come
from `audio/player.js` (`<button class="btn" data-act="…">`) and are
positioned by the existing `.player-controls` flex row at left=16,
top=88 (no explicit per-button absolute coords — they layout in flex
order with gap=0 so the canonical x falls into place). The eject button
is added separately as `<button class="wa-eject" type="button">` inside
`#winamp-chrome` because `audio/player.js` does not emit one and is not
modifiable in this run (architecture lock). Eject is decorative — no
click handler is wired this run; it shows its pressed sprite on
`:active` only.

CSS swaps `background-position-y` from 0 to -18 px on `:active` for the
five wired buttons (they share an 18 px sprite frame), and from 0 to
-16 px on `:active` for eject (16 px sprite frame).

## Position bar (posbar.png)

Verified sheet dimensions:

```
$ sips -g pixelWidth -g pixelHeight images/winamp-skin/base-2.91/posbar.png
/Users/dade/Projects/dade-neocities/images/winamp-skin/base-2.91/posbar.png
  pixelWidth: 307
  pixelHeight: 10
```

Sprite map (per `webamp/js/skinSprites.ts` `POSBAR`):

| sprite                                  | sx  | sy | w   | h  |
| --------------------------------------- | --- | -- | --- | -- |
| `MAIN_POSITION_SLIDER_BACKGROUND`       |   0 |  0 | 248 | 10 |
| `MAIN_POSITION_SLIDER_THUMB`            | 248 |  0 |  29 | 10 |
| `MAIN_POSITION_SLIDER_THUMB_SELECTED`   | 278 |  0 |  29 | 10 |

Canonical placement inside the 275 × 116 main window
(`webamp .actions` block, `#position`):

| element              | left | top | w   | h  |
| -------------------- | ---- | --- | --- | -- |
| Position slider rect |  16  | 72  | 248 | 10 |

This run swaps the prior `.wa-posbar` decorative span for an
`<input type="range" data-role="posbar">` styled via
`::-webkit-slider-runnable-track` (background = the empty crop sprite
slice at `0 0 248 10`) and `::-webkit-slider-thumb` / `::-moz-range-*`
(background = the 29 × 10 thumb sprite at sx=248 normal, sx=278
pressed). The decorative `.wa-posbar` span underneath is retained so
the empty crop is always painted regardless of native range styling
support, and shipping byte-for-byte unchanged when no track is loaded.

The thumb is gated on `body.track-loaded` — the inline IIFE in
`index.html` toggles that class on `data-act="play|pause|next|prev"`
clicks (add) and `data-act="stop"` clicks (remove) inside the audio
mount. `audio/player.js` is unchanged.

## Volume slider (volume.png)

Verified sheet dimensions:

```
$ sips -g pixelWidth -g pixelHeight images/winamp-skin/base-2.91/volume.png
/Users/dade/Projects/dade-neocities/images/winamp-skin/base-2.91/volume.png
  pixelWidth: 68
  pixelHeight: 433
```

Sprite map (per `webamp/js/skinSprites.ts` `VOLUME`):

| sprite                       | sx | sy  | w  | h   |
| ---------------------------- | -- | --- | -- | --- |
| `MAIN_VOLUME_BACKGROUND`     |  0 |   0 | 68 | 420 |
| `MAIN_VOLUME_THUMB`          | 15 | 422 | 14 |  11 |
| `MAIN_VOLUME_THUMB_SELECTED` |  0 | 422 | 14 |  11 |

The 420 px tall background is 28 frames stacked vertically at 15 px
pitch (`webamp/js/components/MainWindow/MainVolume.tsx` computes the
offset as `(sprite - 1) * 15` for sprite index 1..28; we use 0..27 so
the offset is `frame * -15px`). Each rendered frame is 68 × 14 px
visible with 1 px gutter; total per-frame stride = 15 px exactly.

Canonical placement inside the 275 × 116 main window
(`webamp #volume`):

| element              | left | top | w  | h  |
| -------------------- | ---- | --- | -- | -- |
| Volume slider rect   | 107  | 57  | 68 | 14 |

CSS reads the `--vol-frame` custom property (set on `input` event by
the existing inline script in `index.html`) to slide
`background-position-y` to `frame * -15px`. The native range thumb
swaps from `(15, 422)` (normal) to `(0, 422)` (pressed) on `:active`.

## Balance slider (balance.png)

Verified sheet dimensions:

```
$ sips -g pixelWidth -g pixelHeight images/winamp-skin/base-2.91/balance.png
/Users/dade/Projects/dade-neocities/images/winamp-skin/base-2.91/balance.png
  pixelWidth: 68
  pixelHeight: 433
```

Sprite map (per `webamp/js/skinSprites.ts` `BALANCE`):

| sprite                        | sx | sy  | w  | h   |
| ----------------------------- | -- | --- | -- | --- |
| `MAIN_BALANCE_BACKGROUND`     |  9 |   0 | 38 | 420 |
| `MAIN_BALANCE_THUMB`          | 15 | 422 | 14 |  11 |
| `MAIN_BALANCE_THUMB_ACTIVE`   |  0 | 422 | 14 |  11 |

The 420 px tall background uses the same 15 px frame pitch as
`volume.png` (28 frames, 0..27). The active rendered region is 38 px
wide starting at sx=9 within the 68 px sheet (i.e.
`background-position-x: -9px`); previous build used `-15px` which
shifted the groove 6 px right vs canonical — corrected this run.

Canonical placement inside the 275 × 116 main window
(`webamp #balance`):

| element              | left | top | w  | h  |
| -------------------- | ---- | --- | -- | -- |
| Balance slider rect  | 177  | 57  | 38 | 14 |

Frame index for balance = `round(|balance| * 27)` (frame 0 = centered
"no offset"). The native range thumb swaps from `(15, 422)` (normal)
to `(0, 422)` (pressed) on `:active`.

## Slider tooltips (`.wa-tooltip`)

Volume + balance show a hover/focus tooltip rendered with the existing
`text.png` bitmap-font glyph helper (no `VT323`, no real text). The
tooltip span is positioned absolutely inside `#winamp-chrome` ~14 px
above the slider track:

| tooltip          | left | top | source slider                   |
| ---------------- | ---- | --- | ------------------------------- |
| `data-tip-for=vol` | 107 | 43 | volume slider at (107, 57)      |
| `data-tip-for=bal` | 177 | 43 | balance slider at (177, 57)     |

Content strings:

- volume → `"VOLUME: NN%"` (NN = round(value / max * 100))
- balance, value < 0 → `"BALANCE: LEFT NN%"`
- balance, value = 0 → `"BALANCE: CENTER"`
- balance, value > 0 → `"BALANCE: RIGHT NN%"`

Show on `pointerenter` / `focus`, hide on `pointerleave` / `blur`.
The inline IIFE in `index.html` reuses the existing `renderText`
helper (exposed on `window.__waRenderText` from the `spriteText`
IIFE) to write the tooltip glyph row in place — no duplication of
`FONT_LOOKUP`. Hidden state uses the `hidden` HTML attribute so the
element collapses entirely when not active.

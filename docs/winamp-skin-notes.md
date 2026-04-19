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
| Time digits area      | 36  | 26  | 63  | 13 |
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
`background-position: -<digit*9>px 0`. Currently only referenced from
docs; the live time string in `#audio-player-mount [data-role="time"]`
is rendered with VT323 styled to match because per-digit sprite spans
would require touching `audio/player.js`, which is locked.

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

- Render kbps / kHz / scroller text from `text.png` instead of VT323.
- Render time digits from `numbers.png` (would need `audio/player.js`
  changes to emit per-digit spans, currently locked).
- Wire the position bar + `posbar.png` to a seek input.
- Skin the mono / stereo indicators from `monoster.png`.
- Skin the shuffle / repeat toggles from `shufrep.png`.

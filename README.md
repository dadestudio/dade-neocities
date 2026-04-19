# dade-neocities

A period-correct 1998 Geocities-style homepage, hand-built for Neocities.

## Deploy

```
./deploy.sh
```

The deploy is a **hash-on-deploy** flow. Neocities ignores `_headers`, so
the only way to bust browser caches on redeploy is filename content-hashing
(`tokens.css` → `tokens.a1b2c3d4.css`). We do that at deploy time, not in
the working tree.

Steps (all local, working tree untouched):

1. `deploy.sh` wipes and recreates `./build/`.
2. `rsync -a` copies the repo into `build/`, excluding `.git`, `.env`,
   `node_modules`, `scripts/`, `docs/`, `deploy.sh`, `README.md`, etc.
3. `scripts/hash-assets.sh` content-hashes every `.css` / `.js` under
   `build/styles/`, `build/audio/`, `build/effects/`, `build/interactive/`
   (plus `build/scripts/` if present). `build/audio/soundfonts/` and
   `build/sounds/soundfonts/` are skipped — SoundFont sample files are
   large, immutable, and not worth re-hashing.
4. The script rewrites every `.html` in `build/` so references point at
   the new hashed filenames.
5. `neocities push --prune .` is run from inside `build/`. `--prune`
   removes orphaned old-hash files from the server.

Because hashing happens inside `build/` (gitignored), `git status` stays
clean across deploys. The hashed `build/` dir is an ephemeral deploy
artifact, not a source of truth.

Requires the `neocities` Ruby CLI and a prior `neocities login`.

## Assets

| Directory | Contents | Status |
|-----------|----------|--------|
| `images/badges/` | 88x31 retro web badges (webrings, cliques, awards, software). Dark retro-tech only. | Active |
| `images/dividers/` | Horizontal divider GIFs/PNGs. ASCII, scanlines, neon rules. | Active |
| `images/icons/` | Small UI icons (16/24/32px). Phosphor/EGA palette. | Active |
| `images/_retired-g4/` | Original G4-era Geocities pastiche assets. Retained for provenance, not linked from live pages. | Retired Apr 18 2026 |
| `sounds/midi/` | Period-authentic MIDI recreations played through FluidR3_GM via soundfont-player. See [`docs/MIDI_SOURCES.md`](docs/MIDI_SOURCES.md). | Active |
| `sounds/soundfonts/FluidR3_GM/*-mp3.js` | Self-hosted FluidR3_GM SoundFont sample set (29 GM instruments used by the MIDIs above). Source: [gleitz/midi-js-soundfonts](https://github.com/gleitz/midi-js-soundfonts), license MIT. Hosted locally to satisfy Neocities CSP `connect-src 'self'`. | Active |
| `sounds/_retired/` | Legacy single-file `midi.mid` from T3 procedural-synth era. Retained for provenance. | Retired Apr 19 2026 |
| `audio/_retired/` | Retired `synth.js` (procedural oscillators) + `midi-player.js` (oscillator-based MIDI). Replaced by `audio/player.js` + soundfont-player. | Retired Apr 19 2026 |

### MIDI tracklist (`sounds/midi/`)

| Filename | Title — Artist (Year) | Source URL |
|----------|----------------------|------------|
| `01-iris.mid` | Iris — Goo Goo Dolls (1998) | https://bitmidi.com/uploads/50285.mid |
| `02-one-week.mid` | One Week — Barenaked Ladies (1998) | https://bitmidi.com/uploads/15763.mid |
| `03-closing-time.mid` | Closing Time — Semisonic (1998) | https://freemidi.org/getter-6439 |
| `04-sex-and-candy.mid` | Sex and Candy — Marcy Playground (1997) | https://bitmidi.com/uploads/70864.mid |
| `05-torn.mid` | Torn — Natalie Imbruglia (1997) | https://bitmidi.com/uploads/79405.mid |

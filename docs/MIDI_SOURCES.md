# MIDI Sources

Period-authentic MIDI recreations of late-90s alt-rock hits, sourced from
publicly accessible MIDI archives circa 1998 norms. Rendered in-browser via
soundfont-player + the FluidR3_GM SoundFont.

All files are unaltered as downloaded; SHA256 captured at fetch time
(`shasum -a 256`).

---

## 01-iris.mid

- **Song:** Iris
- **Artist:** Goo Goo Dolls
- **Year:** 1998
- **Source URL:** https://bitmidi.com/uploads/50285.mid
- **Source page:** https://bitmidi.com/goo_goo_dolls-iris-mid
- **SHA256:** `8adc4ceed8e97b63f1ab45b5c00003a5861372e3f478b5f95e9ed868150f6825`
- **Notes:** Multi-track GM file, 9 tracks. Plays cleanly through FluidR3_GM.

## 02-one-week.mid

- **Song:** One Week
- **Artist:** Barenaked Ladies
- **Year:** 1998
- **Source URL:** https://bitmidi.com/uploads/15763.mid
- **Source page:** https://bitmidi.com/barenaked-ladies-one-week-k-mid
- **SHA256:** `c1476e5c8278bbf18c301837d5eef57415f59d0076c74a6496cc6a02562ffcdc`
- **Notes:** SMF format 0 (single merged track). Karaoke-arranged ("k"
  suffix in source filename); player skips the percussion channel for
  consistent rendering.

## 03-closing-time.mid

- **Song:** Closing Time
- **Artist:** Semisonic
- **Year:** 1998
- **Source URL:** https://freemidi.org/getter-6439
- **Source page:** https://freemidi.org/download3-6439-closing-time-semisonic
- **SHA256:** `1d120bdf7268d0bdbccee0de7718ebc4ca9f9b59896e36eedf64efee55150424`
- **Notes:** Format 1, 9 tracks. Source requires a session cookie from the
  download page; resolved via curl `--cookie-jar` round-trip.

## 04-sex-and-candy.mid

- **Song:** Sex and Candy
- **Artist:** Marcy Playground
- **Year:** 1997
- **Source URL:** https://bitmidi.com/uploads/70864.mid
- **Source page:** https://bitmidi.com/m-playground-sex-and-candy-mid
- **SHA256:** `3654de1792f04b0129c3aa92a9b3410641184dd31a8d3c2b318674528144ba21`
- **Notes:** Compact 6-track arrangement. The lazy verse melody renders
  faithfully through the GM electric-guitar/bass programs.

## 05-torn.mid

- **Song:** Torn
- **Artist:** Natalie Imbruglia
- **Year:** 1997
- **Source URL:** https://bitmidi.com/uploads/79405.mid
- **Source page:** https://bitmidi.com/natalie-imbruglia-torn-mid
- **SHA256:** `82afcb764edc9f1e6b5c184ec814d4941e60761c9c61b2f4949675521f66d88a`
- **Notes:** Most elaborate of the five — 16 tracks, full vocal melody,
  rhythm guitar, bass, strings.

---

## SoundFont samples

The audio engine renders these MIDIs through the **FluidR3_GM** SoundFont,
served as MP3-encoded JSONP wrappers (`<instrument>-mp3.js`) consumed by
`soundfont-player`.

- **Source repo:** https://github.com/gleitz/midi-js-soundfonts
- **License:** MIT
- **Format:** MP3-encoded JSONP wrappers (one `.js` file per GM instrument,
  containing base64 MP3 samples for each pitch)
- **Hosted at:** `sounds/soundfonts/FluidR3_GM/*-mp3.js`
- **Instrument count:** 29 (the unique non-percussion GM programs used
  across the 5 MIDIs above; channel 9 / drum kit excluded)
- **On-disk size:** ~82,884 KB (~81 MB)

### Why self-hosted

Neocities enforces a server-side Content-Security-Policy of
`connect-src 'self' data: blob:`, which blocks `soundfont-player`'s default
fetch to `gleitz.github.io`. The player is configured with `nameToUrl` +
`format: 'mp3'` options to load samples from the local
`/sounds/soundfonts/FluidR3_GM/` path instead. See `audio/player.js`.

### Instruments included

`acoustic_grand_piano`, `acoustic_guitar_nylon`, `acoustic_guitar_steel`,
`alto_sax`, `baritone_sax`, `cello`, `choir_aahs`, `distortion_guitar`,
`electric_bass_finger`, `electric_bass_pick`, `electric_guitar_clean`,
`electric_guitar_jazz`, `electric_piano_2`, `english_horn`, `lead_1_square`,
`lead_6_voice`, `marimba`, `overdriven_guitar`, `pad_1_new_age`, `pad_2_warm`,
`pad_4_choir`, `pad_6_metallic`, `slap_bass_1`, `string_ensemble_1`,
`string_ensemble_2`, `synth_strings_1`, `tuba`, `viola`, `voice_oohs`.

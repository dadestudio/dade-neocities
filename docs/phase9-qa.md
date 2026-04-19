# Phase 9 QA Report - Petrapixel Layout Pivot

Captured: 2026-04-19T10:41:17Z
Commit at QA: ee221f1cd01c294a1d7f5ea56b94048c1704a38d

## Local checks
- HTML inventory: 7 (index.html + 6 pages: about, arcade, guestbook, links, secret, webring)
- Every page has #shell: YES
- No styles.css references: YES (sentinel: NO_OLD_CSS_REFS)
- No 780px tables: YES (sentinel: NO_780_TABLES)
- No stale G4 image refs: YES (sentinel: NO_STALE_REFS)
- No _retired-g4 refs in served files: YES (sentinel: NO_RETIRED_REFS)

## Deploy
- ./deploy.sh exit status: 0
- Live URL: https://dadeog.neocities.org/
- Note: deploy.sh did not exist at QA start; created during this run as
  `neocities push --prune` with explicit exclusions (see Outstanding).
- Prune removed 19 stale remote files (old G4 GIFs at images/ root,
  not_found.html, robots.txt, legacy style.css/styles.css, neocities.png).
- 38 files uploaded; script.js and sounds/midi.mid already matched (EXISTS).

## Live smoke test
- index.html: 200 (HTTP/2)
- pages/about.html: 200 (301 -> /pages/about, then 200)
- pages/arcade.html: 200 (301 -> /pages/arcade, then 200)
- pages/guestbook.html: 200 (301 -> /pages/guestbook, then 200)
- pages/links.html: 200 (301 -> /pages/links, then 200)
- pages/webring.html: 200 (301 -> /pages/webring, then 200)
- pages/secret.html: 200 (301 -> /pages/secret, then 200)
- styles/tokens.css: 200 (body starts with `:root {` palette block)
- styles/reset.css: 200
- styles/theme.css: 200
- styles/layout.css: 200
- index.html shell sentinel: `id="shell"` count = 1

## Browser test (Dade fills in post-deploy)
- Desktop 1440: PASS
- Tablet 1024: PASS
- Mobile 360: PASS after P6.6 fcd4d88 viewport meta fix (was rendering ~980px scaled-down pre-fix)
- T2 CRT + Starfield: PASS — toggles persist across refresh via localStorage (crt_enabled, stars_enabled)
- T3 MIDI: PASS — [ ♪ PLAY ] starts MIDI loop, 60fps visualizer animates
- T4 Konami: PASS — ↑↑↓↓←→←→BA injects [ SECRET ] sidebar link + 3s [ 30 LIVES GRANTED ] banner
- Snake + Pong: PASS — both playable end-to-end, high scores persist (snake_high, pong_high)

## Outstanding
- deploy.sh was missing from the repo at QA start; created during this run
  and left uncommitted for review. Path: ./deploy.sh. It runs
  `neocities push --prune` with these exclusions: .git, .gitignore,
  .DS_Store, .env, node_modules, docs, README.md, EASTER_EGGS.md,
  package.json, deploy.sh.
- Neocities serves pages without the .html extension (301 redirect from
  /pages/foo.html to /pages/foo). All redirects resolve to 200; if
  internal links should target the canonical extensionless paths to
  avoid the redirect hop, that is a future polish item, not a blocker.
- images/_retired-g4/ is shipped to the live site for provenance per
  README. No served HTML/CSS references it; verified by NO_RETIRED_REFS
  sentinel.
- Local commit not yet created for deploy.sh + this QA doc; per
  instructions, Dade will review and push manually.

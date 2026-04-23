# Winamp Visual Regression Baselines

This folder stores pixel baselines for the Winamp chrome rendered from `dadeog.neocities.org`.

## Purpose

The harness captures screenshots for the main window, equalizer, and playlist and compares them against committed PNG references.
It is intended to catch unintended visual drift in the Winamp chrome before shipping.

## Commands

- `npm run visual-check` captures current screenshots and compares against existing baselines.
- `npm run visual-update` captures current screenshots and overwrites all three baselines.

## First run behavior

When a baseline file does not exist, `npm run visual-check` seeds it from the freshly captured image and logs `BASELINE_SEEDED <name>`.
This first seed run exits successfully as long as no required selector is missing.

## Using Skin Museum renders

If you have an approved replacement render for a target, save it over:

- `docs/reference/winamp-main-1x.png`
- `docs/reference/winamp-eq-1x.png`
- `docs/reference/winamp-pl-1x.png`

Then run `npm run visual-check` to verify the current site output against those reference images.

## Regenerate after intentional UI changes

1. Run `npm run visual-update`.
2. Review generated outputs in `docs/reference/diffs/` and confirm intentional changes.
3. Re-run `npm run visual-check` to confirm clean comparisons.
4. Commit updated baseline PNGs with the associated code change.

## Determinism lock

The harness freezes these `localStorage` keys before navigation:
`wa_eq_open`, `wa_pl_open`, `wa_shade_main`, `wa_shade_eq`, `wa_shade_pl`, `wa_pos_main`, `wa_pos_eq`, `wa_pos_pl`, `wa_viz_mode`, `mix_preset`.

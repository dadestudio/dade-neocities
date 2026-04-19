# Perf Report - T8 (post-Phase 9 + P7-polish vs T1 baseline)

- **Date (UTC):** 2026-04-19T12:35:22Z
- **Live URL:** https://dadeog.neocities.org
- **Baseline commit (T1):** `b47babe`
- **Current commit (HEAD):** `73679b4`
- **Branch:** `main`
- **Tool:** Lighthouse via `npx lighthouse` (headless Chrome, mobile default)
- **Inputs:**
  - Baseline: `docs/lighthouse-baseline.json`
  - Current:  `docs/lighthouse-post-phase9.json`

## Category Scores

| Category       | Baseline | Current | Delta |
|----------------|---------:|--------:|------:|
| Performance    |       98 |      98 |     0 |
| Accessibility  |       87 |     100 |   +13 |
| Best Practices |       88 |      96 |    +8 |
| SEO            |       92 |      90 |    -2 |

## Core Metrics

| Metric                          | Baseline | Current | Delta        |
|---------------------------------|---------:|--------:|-------------:|
| First Contentful Paint (ms)     |     1043 |    1616 | +573 (+55.0%) |
| Largest Contentful Paint (ms)   |     1606 |    1616 |   +10 (+0.6%) |
| Total Blocking Time (ms)        |        0 |       0 |             0 |
| Cumulative Layout Shift         |     0.00 |    0.00 |          0.00 |
| Speed Index (ms)                |     4067 |    3636 | -431 (-10.6%) |
| Time to Interactive (ms)        |     1621 |    1616 |   -5  (-0.3%) |

## Regressions

Rule: flag any **category delta <= -3 points** OR any **metric delta > 10% worse**.

- **FCP regressed +573 ms (+55%)** — first paint nearly 0.6 s slower. Hypothesis: P7-polish added a same-origin favicon + extensionless URL routing (server rewrite) that delays the first byte / first paint vs the bare T1 page; Phase 9 panel dashboard markup also pushes more above-the-fold DOM than the T1 layout.
- No category regressed by ≥ 3 points (SEO -2 is within noise; both `doctype` and `meta-description` audits are unchanged from baseline at score 0).
- LCP held flat (+10 ms), so the FCP regression is a paint-scheduling/critical-path issue, not a payload regression.

## Quick Wins

Audits in current run with `score < 0.9` (excluding `notApplicable`), grouped by category:

### Performance
- `speed-index` (0.86) — *Speed Index*. Already trending the right way (-10.6% vs baseline); preload the hero font/CSS and inline critical CSS to push past 0.9.
- `cache-insight` (0.50) — *Use efficient cache lifetimes*. Neocities serves short `Cache-Control` by default; add long-lived hashed asset filenames or a `_headers`/edge config if available, otherwise accept as platform constraint.
- `network-dependency-tree-insight` (0.00) — *Network dependency tree*. Flatten the critical chain by inlining the small CSS bundle and `<link rel=preload>` for the largest blocking asset.
- `render-blocking-insight` (0.00) — *Render-blocking requests*. Move non-critical `<link rel=stylesheet>` to `media="print" onload` swap or async-load via `rel=preload` + `onload`.

### Accessibility
- (none — clean sweep at 100)

### Best Practices
- `doctype` (0) — *Page lacks the HTML doctype, thus triggering quirks-mode*. Pre-existing in baseline (also 0). Trivial single-line fix candidate (add `<!doctype html>` to `index.html`) — flagged below as follow-up T-run rather than fixed in this run, since the task scope is no-code and this audit was already failing at T1 (not a regression).

### SEO
- `meta-description` (0) — *Document does not have a meta description*. Pre-existing in baseline. Add `<meta name="description" content="…">` to each HTML page (one-line per page).

## Verdict

**SOFT REGRESSION** — the headline Performance category score is flat at 98/100 and Accessibility / Best Practices both improved materially, but FCP regressed by 55% (+573 ms). LCP/TBT/CLS/TTI/SI are all neutral-or-better. No category dropped ≥ 3 points. Treat as soft because user-perceived load (LCP, TTI) is unchanged and the regression is isolated to first paint timing.

## Follow-up T-run candidates

Per task scope, **no code fixes were made in this run**. Suggested follow-ups:

1. **T9 — FCP recovery**: profile the critical render path on the live site (Phase 9 panel dashboard + P7 favicon/route changes); inline critical CSS, async-load the rest, preload hero assets. Target: FCP back under 1.1 s.
2. **T10 — Trivial best-practices/SEO sweep** (single-line each): add `<!doctype html>` and `<meta name="description">` to `index.html` and any other top-level pages. Should bump Best Practices and SEO categories closer to 100.
3. **T11 — Cache headers**: investigate Neocities options for longer `Cache-Control` lifetimes (or accept platform limit and document the constraint).

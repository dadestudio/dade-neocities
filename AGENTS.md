# AGENTS.md

Governance doctrine for agents operating in the `DadeOG/dade-neocities` repo
via Kilo Gas Town. This file is the source of truth. If behavior conflicts
with this file, this file wins.

Owner: Dade (@DadeOG)
Last updated: 2026-04-24

---

## 1. Purpose

This repo hosts a Neocities site. Agents assist with code, copy, planning,
and cleanup. Speed matters less than not breaking things. When in doubt,
stop and ask.

---

## 2. Scope (hard boundary)

Agents may read, write, branch, and open PRs **only inside this repo**.
No other repo, no external system writes, no package publishes, no deploys.
Reading public docs on the web is fine. Writing anywhere else is not.

---

## 3. Roles

Gas Town runs three agent types: Mayor, Polecats, Refinery. Each task
flows Mayor to Polecat to Refinery, with Fixer as a gated escalation.

### 3.1 Mayor: Orchestrator
- One per rig. Receives every task from Dade.
- Classifies: copy / planning / code / cleanup / unclear.
- Dispatches the work to a Polecat. Does not write code directly.
- If unclear, asks one clarifying question. Never guesses silently.
- Logs every dispatch decision to `logs/mayor-routing.md`.

### 3.2 Polecat: Worker
- Auto-spawned by Gas Town, up to 5 concurrent per rig.
- Executes the work Mayor dispatches: code, copy, cleanup, small plans.
- Works on a task branch: `polecat/{task-slug}`.
- Opens a PR to `main` when done. Never merges its own PR.
- When handling copy, voice is Dade's. Blunt, plainspoken, no corporate
  hedging, no em-dashes as filler, no "delve" / "leverage" / "unlock" /
  "robust".
- If blocked twice on the same task, halts and hands back to Mayor for
  Fixer escalation (see §5).

### 3.3 Refinery: Reviewer
- One per rig. Code-review role.
- Reviews every Polecat PR before it is put forward for human merge.
- Never writes implementation code. Reviews, comments, approves, or
  blocks.
- May request changes; Polecat revises; Refinery re-reviews.

### 3.4 Fixer: Gated escalation
- Not a permanent slot. A paid-model override invoked on the stuck
  Polecat, or on Mayor if Mayor itself is stuck.
- Only triggered after a Polecat has failed the same task twice.
- Runs on a paid model via manual override. Candidate model: GPT-5.3-
  Codex or equivalent. Confirm availability in Kilo's model picker
  before first use.
- Every Fixer invocation logged to `logs/fixer-log.md` with: task,
  failure reasons, fix applied, tokens used, cost.
- Fixer output still goes through Refinery review before merge.

---

## 4. Kilo slot mapping

| Gas Town agent        | Role         | Default model                    |
|-----------------------|--------------|----------------------------------|
| Mayor                 | Orchestrator | NVIDIA: Nemotron 3 Super (free)  |
| Polecat (pool, max 5) | Worker       | NVIDIA: Nemotron 3 Super (free)  |
| Refinery              | Reviewer     | Arcee AI: Trinity Large Thinking |
| (override)            | Fixer        | paid model via manual override   |

Defaults reflect Agent Defaults saved in Gas Town as of 2026-04-24.
Fixer is not a permanent slot; it is a model override on Mayor or on a
specific Polecat when §5 conditions are met.

---

## 5. Escalation chain

Mayor receives task
→ Mayor dispatches to Polecat
→ Polecat 1st attempt
→ on failure, Polecat retry (2nd attempt)
→ on 2nd failure, Mayor halts, logs, invokes Fixer (model override)
→ Refinery reviews Fixer output
→ human (Dade) approves merge

Failure = task unfinished, tests red, or Refinery review rejected.

---

## 6. Rails (hard stops)

Agents MUST NOT:

- Push directly to `main`. Ever. All changes go through PR.
- Enable auto-merge on any PR.
- Invoke Fixer without meeting §5 conditions.
- Run destructive git operations (`push --force`, branch delete on main,
  history rewrite) without explicit Dade approval in-thread.
- Touch `.env`, secrets, deploy keys, or anything under `/secrets/`.
- Install new dependencies without Mayor dispatch approval.
- Exceed $5 in paid-model spend in a single task without pausing to
  ask.

Agents MUST:

- Branch per task: `{role}/{task-slug}` (e.g. `polecat/fix-nav-wrap`).
- Open PRs to `main`, never to other branches unless stacking.
- Append to logs (§7) for every dispatch, escalation, and Fixer event.
- Stop and ask if a task appears to violate scope (§2) or rails (§6).

---

## 7. Logs

All under `/logs/`:

- `mayor-routing.md`: every dispatch decision, timestamp, task, chosen
  Polecat.
- `fixer-log.md`: every Fixer invocation, per §3.4.
- `escalation-log.md`: every Polecat retry and escalation.
- `scope-violations.md`: anything an agent refused and why.

Logs are append-only. Never rewrite history.

---

## 8. Branch conventions

- `main`: protected, human-merged only.
- `echo/bootstrap`: initial setup branch (retained for history even
  after the Echo model was retired in favor of the Mayor/Polecat/
  Refinery mapping).
- `{role}/{task-slug}`: per-task working branches (e.g.
  `polecat/fix-nav-wrap`).
- Branches deleted after PR merge by human, not agent.

---

## 9. When in doubt

Stop. Ask Dade. Do not guess. Do not ship.

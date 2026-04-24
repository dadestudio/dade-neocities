# HEARTBEAT.md — Agent Liveness Log

## Purpose
Agents write an entry here on task completion to confirm liveness and last known state.
This file is the primary diagnostic when a convoy goes silent.

## Who Writes
- Mayor: on convoy open, convoy close, and any escalation
- Polecats: on each bead completion

## Who Reads
- Dade: via Telegram status command or direct git log HEARTBEAT.md
- Mayor: on session resume to reconstruct last known state

## Entry Format
[TIMESTAMP UTC] [ROLE] [BEAD-ID or CONVOY-ID] STATUS: one line summary

## Example
[2026-04-24T09:00:00Z] Mayor conv-001 STATUS: Convoy open, 2 polecats dispatched
[2026-04-24T09:04:12Z] Polecat gt-abc12 STATUS: Complete — wrote index.html
[2026-04-24T09:05:10Z] Mayor conv-001 STATUS: Convoy closed, PR #2 opened

## Cadence
On task completion only. Not on a timer.

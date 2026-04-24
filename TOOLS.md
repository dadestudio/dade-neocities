# TOOLS.md — Gas Town Tool Registry

## Available Integrations

### GitHub
- Scope: `dadestudio/dade-neocities` only
- Fine-grained PAT, 90-day expiry
- Agents may read/write files, open PRs, and merge with Mayor approval
- No access to other repos or orgs

### Telegram
- Role: primary user-facing channel for Echo
- Incoming: commands from Dade
- Outgoing: task status, completion notices, escalation alerts

### Slack
- Status: connected, role TBD
- Available for future routing; do not use until role is defined

### Kilo Gateway
- 500+ models via unified API
- Agents request model escalation through AGENTS.md §3.4 criteria
- Zero markup on tokens; billing consolidated to Kilo dashboard

## Shell Execution Rules
- Mayor and Polecats may run read-only shell commands autonomously
- Destructive commands (delete, overwrite, push to main) require Mayor sign-off
- No sudo, no credential access outside scoped PAT

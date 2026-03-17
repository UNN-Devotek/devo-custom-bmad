# squid-master-sidecar

Persistent memory for the **Squid-Master** (Krakken) agent — Agile Workflow Orchestrator.

## Purpose

Stores cross-session state so Squid-Master can resume in-progress sprints, remember user
preferences, detect stale documentation, and retry failed RAG syncs without losing context.

## Files

| File | Purpose |
|------|---------|
| `memories.md` | Cross-session user preferences and observed patterns |
| `instructions.md` | Operating instructions: workflow tracks, RAG routing guide, branch rules, context injection |
| `session-state.md` | Active branch, workflow position, docs hashes, pending RAG syncs |
| `triage-history.md` | Rolling log of S/M/L triage decisions (max 20 entries) |
| `docs-index.md` | Auto-generated index of docs/ for sub-agent context injection |

## Runtime Access

After BMAD installation, this folder is accessible at:
`{project-root}/_bmad/_memory/squid-master-sidecar/`

## Primary vs Secondary Storage

- **Primary:** This sidecar folder — always available, no network dependency
- **Secondary:** RAG `agent_sessions` MongoDB — synced on [SV save-session] and session end

The sidecar is always the source of truth. RAG is for cross-tool search and backup.

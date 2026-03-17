# Squid-Master — Triage History

> Rolling log of S/M/L triage decisions. Max 20 entries — oldest evicted during [SV save-session]
> when limit is exceeded. Used for context and pattern recognition across sessions.

```yaml
entries:
  - session_id: "2026-03-11-shikaku-daily-mode-007a"
    date: "2026-03-11"
    description: "Add daily Shikaku mode, DRY extract daily game infrastructure from Wordle into shared helpers"
    track: LARGE
    corrected_to: null
    q1_scope: "9+ files — shikaku.py, shikaku_routes.py, models.py, schema_migrations.py (core), daily_helpers.py, wordle_routes.py refactor, base.py, frontend Shikaku component, frontend daily leaderboard"
    q2_risk: "New ShikakuDailyAttempt table, schema_migrations.py (core file) touched"
    q3_reversibility: "Schema change — not single-commit reversible"
    branch: "feat/shikaku-daily-mode"
    linked_feedback_ids: []
    actual_track: null
    shipped_clean: null

  - session_id: "2026-03-10-wordle-session-persistence-b4e7"
    date: "2026-03-10"
    description: "Fix Wordle session timeout, add timeout indicator and persistent daily attempt storage"
    track: LARGE
    corrected_to: null
    q1_scope: "3–5 files — Wordle backend session logic, frontend indicator, daily persistence"
    q2_risk: "Schema change required to persist guess data server-side"
    q3_reversibility: "No down migration planned — not cleanly single-commit reversible"
    branch: "fix/fb-0176-wordle-session-persistence"
    linked_feedback_ids: ["FB-0176"]
    actual_track: null
    shipped_clean: null
```

# Squid-Master — Memories

> Cross-session user preferences and team context. Populated during first live session.
> Updated by Squid-Master when user preferences are expressed or patterns are observed.

last_updated: "2026-03-09"

## User Preferences

execution_mode_preference: 4  # 1=same-conv | 2=command blocks | 3=launch scripts | 4=agent teams
confirmed_without_asking: false
preferred_branch_prefix: feat

## Team Context

<!-- Populated from MCP lookups and user statements -->
<!-- Example:
active_team_members:
  - handle: kira
    role: frontend
  - handle: morgan
    role: backend
-->

## Observed Patterns

- Multi-conversation setup: Master = orchestration, Planning = planning/PMR/architecture, Dev = implementation (named "production"), QA = testing/qa-automate
- Route handoffs to the correct open conversation by purpose — do not tell user to open a new conversation

## Session Ratings

<!-- Populated at end of each session when user provides rating -->
<!-- Example:
session_ratings:
  - session_id: "2026-03-09-trading-cards-a3f2"
    rating: 4
    note: "Good routing, branch creation was smooth"
-->

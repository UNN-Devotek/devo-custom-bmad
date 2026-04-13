# CLAUDE.md — Arcwright Workshop

AI assistant instructions for the Arcwright agent workflow package.

## What This Repo Is

This is the **Arcwright workshop** — the editing workspace and build pipeline for the `@arcwright/agent-orchestration` npm package. It produces distributable AI agent workflows, skills, and orchestration tools for multiple IDEs.

- **npm org:** `@arcwright`
- **GitHub:** https://github.com/UNN-Devotek/Arcwright-AI
- **Published package:** `@arcwright/agent-orchestration`

## Publishing

This is the **only** place packages are published from. The Squidhub repo keeps its Squidhub-specific content unpublished — it's just local overlay files, not a separate package.

**First-time setup:**
1. Register `@arcwright` npm org on npmjs.com
2. Add npm auth token: `npm config set //registry.npmjs.org/:_authToken <token>`

**To publish:**
```bash
node build/build.js                                    # build package
cd packages/agent-orchestration && npm publish --access public
```

**What gets published:**
- `@arcwright/agent-orchestration` — single package containing:
  - `_arcwright/{awm,awb,core,_memory}/` — agent/workflow modules
  - `.agents/skills/` — 54+ skills (Claude Code format)
  - `.kiro/skills/` — same skills (Kiro IDE + CLI format)
  - `.kiro/steering/` — Kiro steering docs
  - `.claude/commands/arcwright-track-*.md` — slash commands
  - `tmux/` — tmux setup scripts
- CLI binaries: `arcwright`, `arcwright-install`
- Installer supports: Claude Code, Kiro (IDE + CLI), Cursor, Windsurf, Cline, GitHub Copilot, Gemini
- Install modes: project-level (default) or global (`--global`)

## Repo Structure

```
arcwright/
├── _arcwright/              <- Agent/workflow source (editable)
│   ├── awm/                 <- Arcwright Method module (analyst, architect, dev, pm, qa, etc.)
│   ├── awb/                 <- Arcwright Builder module (agent/workflow/module creation)
│   ├── core/                <- Core orchestrator agent + config
│   └── _memory/             <- Sidecar memory + skills
├── .agents/skills/          <- Skill library (54+ skills, SKILL.md format)
├── .claude/commands/        <- Slash commands (arcwright-track-*.md)
├── docs/dev/tmux/           <- tmux scripts
├── packages/
│   └── agent-orchestration/ <- npm package
│       ├── bin/arcwright.js  <- npx entry point
│       ├── lib/              <- Installer, CLI, platform detection (EDIT THESE)
│       ├── src/              <- Built output (NEVER edit — wiped on build)
│       └── package.json
├── build/
│   └── build.js             <- Workshop packager
```

## Build Pipeline

```bash
node build/build.js
```

Pipeline steps:
1. `buildGenericPackage()` — copies `_arcwright/` modules + `.agents/skills/` → `src/`
2. `buildKiroAssets()` — copies skills → `src/.kiro/skills/`, generates steering docs
3. `bundleTrackCommands()` — copies `arcwright-track-*.md` → `src/.claude/commands/`
4. `bundleTmuxSetup()` — copies tmux scripts → `src/tmux/`
5. `verifyNoLeaks()` — scans for Squidhub content patterns, fails if found

## Key Rules

- **Never edit `src/` directories** — wiped on every build
- **`lib/` and `bin/` are permanent** — edit these for installer behavior changes
- **No Squidhub content** — this repo is the generic package. The leak checker enforces this
- **Skills are dual-format** — `.agents/skills/` SKILL.md files work for both Claude Code and Kiro (same frontmatter: `name`, `description`, `allowed-tools`)

## Installer Features

The installer (`lib/installer.js`) supports:

**7 IDE platforms:** Claude Code, Kiro, Cursor, Windsurf, Cline, GitHub Copilot, Gemini

**Install scopes:**
- `npx @arcwright/agent-orchestration` — project-level install (interactive)
- `npx @arcwright/agent-orchestration --global` — global install to `~/` config dirs
- `npx @arcwright/agent-orchestration --tools claude-code,kiro` — multi-IDE install

**Cross-platform:** Windows (WSL2), Linux, macOS. WSL dual-home aware — terminal tools (Claude Code, Gemini) use Linux home, GUI IDEs (Kiro, Cursor, etc.) use Windows home.

## Module Reference

| Module | Dir | Contents |
|--------|-----|----------|
| AWM (Method) | `_arcwright/awm/` | Specialist agents: analyst, architect, dev, pm, qa, sm, tech-writer, ux-designer |
| AWB (Builder) | `_arcwright/awb/` | Meta-agents for creating new agents, workflows, and modules |
| Core | `_arcwright/core/` | Master orchestrator agent, templates, core workflows |
| Memory | `_arcwright/_memory/` | Sidecar files, skill definitions |

## Relationship to Squidhub

This workshop is the **single publish source** for `@arcwright/agent-orchestration`.

The Squidhub project (`/mnt/d/Projects/Unnamed/Squidhub Master/Squidhub-production/`) keeps its own Squidhub-specific overlay files (squid-master persona, MCP templates, etc.) locally in `_bmad/squidhub/` and `_bmad/_memory/squid-master-sidecar/`. These are **not published** — they sit on top of the installed Arcwright package for Squidhub's own use.

The Squidhub packager (`scripts/bmad-build/build.js`) still exists for internal builds but is no longer the publish path.

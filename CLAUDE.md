# CLAUDE.md — Arcwright Workshop

AI assistant instructions for the Arcwright agent workflow package.

## What This Repo Is

This is the **Arcwright workshop** — the editing workspace and build pipeline for the `@arcwright-ai/agent-orchestration` npm package. It produces distributable AI agent workflows, skills, and orchestration tools for multiple IDEs.

- **npm org:** `@arcwright-ai`
- **GitHub:** https://github.com/UNN-Devotek/Arcwright-AI
- **Published packages:** `@arcwright-ai/agent-orchestration`, `@arcwright-ai/tmux-setup`
- **Website:** `website/` — Vite + React site hosted at **arcwright.space** on Dokploy

## Website — arcwright.space

The `website/` subfolder is a Vite + React + TypeScript marketing/docs site deployed at **arcwright.space**.

**Rule: keep both in sync.** Whenever you update:
- `README.md` — the website auto-pulls live from GitHub on page load, but update `website/src/data/fallback.ts` if the content structure changes significantly
- Track list, team catalog, or agent roster — also update the corresponding file in `website/src/data/`
- Design or component changes — only in `website/src/`; never modify parent repo files

**Deployment (Dokploy):**
```bash
cd website
docker compose up -d   # or let Dokploy build from the Dockerfile
```

The `docker-compose.yml` includes Traefik labels for `arcwright.space` with automatic TLS via Let's Encrypt.

## Publishing

This is the **only** place packages are published from. The Squidhub repo keeps its Squidhub-specific content unpublished — it's just local overlay files, not a separate package.

**First-time setup:**
1. Register `@arcwright-ai` npm org on npmjs.com
2. Add npm auth token: `npm config set //registry.npmjs.org/:_authToken <token>`

**To publish:**
```bash
node build/build.js                                    # build agent-orchestration package
cd packages/agent-orchestration && npm publish --access public
cd packages/tmux-setup && npm publish --access public
```

**What gets published:**
- `@arcwright-ai/agent-orchestration` — single package containing:
  - `_arcwright/{awm,awb,core,_memory}/` — agent/workflow modules
  - `.agents/skills/` — 54+ skills (Claude Code format)
  - `.kiro/skills/` — same skills (Kiro IDE + CLI format)
  - `.kiro/steering/` — Kiro steering docs
  - `.kiro/agents/` — Kiro agent JSON configs (auto-generated from `.claude/commands/` + specialist stubs)
  - `.claude/commands/arcwright-track-*.md` — slash commands
  - `tmux/` — tmux setup scripts
- `@arcwright-ai/tmux-setup` — standalone tmux setup package:
  - Catppuccin theme, pane title sync, clipboard integration
  - Agent orchestration scripts, status bar widgets
  - CLI binary: `arcwright-tmux`
- CLI binaries: `arcwright`, `arcwright-install`, `arcwright-tmux`
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
├── .claude/commands/        <- Slash commands (arcwright-track-*.md, arcwright-migrate.md)
├── packages/
│   ├── agent-orchestration/ <- npm package (@arcwright-ai/agent-orchestration)
│   │   ├── bin/arcwright.js  <- npx entry point
│   │   ├── lib/              <- Installer, CLI, platform detection (EDIT THESE)
│   │   ├── src/              <- Built output (NEVER edit — wiped on build)
│   │   └── package.json
│   └── tmux-setup/          <- npm package (@arcwright-ai/tmux-setup)
│       ├── bin/arcwright-tmux.js <- npx entry point
│       ├── lib/              <- Installer, CLI (EDIT THESE)
│       ├── src/tmux/         <- tmux config + scripts (EDIT THESE)
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
3. `bundleKiroAgents()` — generates `.kiro/agents/*.json` from `.claude/commands/*.md` + specialist stubs from `_arcwright/awm/agents/`
4. `bundleTrackCommands()` — copies `arcwright-track-*.md` → `src/.claude/commands/`
5. `bundleTmuxSetup()` — copies tmux scripts → `src/tmux/`
6. `verifyNoLeaks()` — scans for Squidhub content patterns, fails if found

## Key Rules

- **Never edit `src/` directories** — wiped on every build
- **`lib/` and `bin/` are permanent** — edit these for installer behavior changes
- **No Squidhub content** — this repo is the generic package. The leak checker enforces this
- **Skills are dual-format** — `.agents/skills/` SKILL.md files work for both Claude Code and Kiro (same frontmatter: `name`, `description`, `allowed-tools`)

## Kiro CLI Rules

Kiro CLI has its own agent format, tool names, and orchestration model. Follow these rules when adding or modifying anything that touches Kiro.

**Agent format:**
- Kiro agents are **JSON files** (`.kiro/agents/*.json`), not markdown. Schema: `{ name, description, prompt, tools, allowedTools, toolsSettings, resources, hooks, mcpServers }`
- The `prompt` field is either inline text or a `file://` URI pointing to a prompt file
- Skills are loaded via `"resources": ["skill://.kiro/skills/**/SKILL.md"]` — always include this on agents that need skill access
- Agent filenames (without `.json`) become the agent name used in `/agent` and `subagent` tool `role` references

**Tool names — Kiro uses different identifiers than Claude Code:**

| Claude Code | Kiro CLI |
|-------------|----------|
| Read file | `fs_read` |
| Write file | `fs_write` |
| Bash | `execute_bash` |
| Grep | `grep` |
| Glob | `glob` |
| Code intelligence | `code` |
| Web search | `web_search` |
| Web fetch | `web_fetch` |
| Agent tool | `subagent` |
| Knowledge | `knowledge` |
| AWS | `use_aws` |
| All built-in | `@builtin` |

**Subagent orchestration:**
- Kiro's `subagent` tool takes `{ task, stages: [{ name, role, prompt_template, depends_on, model }] }` — it's a DAG pipeline, not a single agent dispatch
- The `role` field references a Kiro agent config name (e.g. `arcwright-dev`) — that agent must exist in `.kiro/agents/`
- Stages with no `depends_on` run in parallel; dependent stages wait
- Configure available agents via `toolsSettings.crew.availableAgents` in the orchestrator agent's JSON

**tmux split-pane mode:**
- Kiro CLI supports tmux workflows via `execute_bash` — spawn agents with `kiro-cli chat --trust-all-tools --agent <name> '<task>'`
- `--trust-all-tools` is the Kiro equivalent of Claude's `--dangerously-skip-permissions` — always include it for spawned pane agents
- The AGENT_SIGNAL protocol, message delivery verification, and pane close sequence from `tmux-protocol` skill apply identically
- `--no-interactive` flag exists for headless/scripted usage

**Build pipeline (`bundleKiroAgents()` in `build/build.js`):**
- Reads `.claude/commands/*.md` and generates `.kiro/agents/*.json` — the build handles the format conversion
- `adaptPromptForKiro()` rewrites prompts: `.agents/skills/` → `.kiro/skills/`, `$ARGUMENTS` → user message instruction, `claude --dangerously-skip-permissions` → `kiro-cli chat --trust-all-tools --agent`
- Specialist agent stubs are auto-generated from `_arcwright/awm/agents/*.md` with `file://` prompt references
- Track/team agents get a tmux addendum appended and `toolsSettings.crew` with all specialist agent names

**Installer (`writeKiroConfig()` in `lib/installer.js`):**
- Copies `.kiro/agents/*.json`, `.kiro/skills/`, `.kiro/steering/` — filters by `--no-teams` and `--docker-check` flags
- Global installs go to `~/.kiro/` (or Windows home on WSL since Kiro IDE is a GUI app)
- No hooks directory — Kiro hooks are defined inside agent JSON configs, not as files

**When adding a new slash command:**
1. Create the `.claude/commands/foo.md` as usual (Claude Code source of truth)
2. Add the filename regex to `SHIPPED_COMMANDS` in `bundleKiroAgents()`
3. Add a tool mapping entry in `KIRO_TOOLS_BY_PATTERN` with correct Kiro tool names
4. The build will auto-generate `.kiro/agents/foo.json` with adapted prompts
5. If the command needs the `subagent` tool, add it to the tool list

**When adding a new specialist agent:**
1. Create the agent `.md` file in `_arcwright/awm/agents/`
2. The build auto-generates `.kiro/agents/arcwright-{slug}.json` from it
3. Add the new agent name to `SPECIALIST_AGENTS` array in `bundleKiroAgents()` so it appears in `toolsSettings.crew.availableAgents`

**When modifying skills:**
- Skills in `.agents/skills/` are the single source of truth — the build copies them to `.kiro/skills/` unchanged
- SKILL.md frontmatter (`name`, `description`) works for both Claude Code and Kiro
- If a skill references `.agents/skills/` paths internally (cross-skill references), those paths will be correct for Claude Code but not Kiro — add a Kiro-specific note or use relative paths
- If a skill has IDE-specific instructions (e.g. tmux spawning), add a clearly marked section for each IDE rather than replacing the existing one

**When modifying workflow track skills:**
- Always include both a tmux variant (split-pane) and a non-tmux variant (subagent pipeline)
- The tmux variant uses `kiro-cli chat --trust-all-tools --agent` for Kiro, `claude --dangerously-skip-permissions` for Claude Code
- The non-tmux variant should include a Kiro CLI `subagent` tool JSON example with `stages` and `depends_on`

## Installer Features

The installer (`lib/installer.js`) supports:

**7 IDE platforms:** Claude Code, Kiro, Cursor, Windsurf, Cline, GitHub Copilot, Gemini

**Install scopes:**
- `npx @arcwright-ai/agent-orchestration` — project-level install (interactive)
- `npx @arcwright-ai/agent-orchestration --global` — global install to `~/` config dirs
- `npx @arcwright-ai/agent-orchestration --tools claude-code,kiro` — multi-IDE install
- `npx @arcwright-ai/agent-orchestration update --global` — update existing global install

**Cross-platform:** Windows (WSL2), Linux, macOS. WSL dual-home aware — terminal tools (Claude Code, Gemini) use Linux home, GUI IDEs (Kiro, Cursor, etc.) use Windows home.

**All CLI flags:**

| Flag | Default | What it does |
|------|---------|--------------|
| `--yes`, `-y` | false | Skip interactive prompts, accept all defaults |
| `--global`, `-g` | false | Install to `~/.arcwright` / `~/.claude/` / `~/.kiro/` |
| `--directory <path>`, `-d` | cwd | Target project root |
| `--tools <ids>` | `claude-code` | Comma-sep: `claude-code,kiro,cursor,windsurf,cline,github-copilot,gemini` |
| `--modules <ids>` | `awm,awb,core,_memory` | Which modules to install |
| `--user-name <name>` | prompted | Your name (written into config.yaml) |
| `--output-folder <path>` | `_arcwright-output` | Where Arcwright writes output artifacts |
| `--no-teams` | teams included | Skip the 17 team-* skills and `/team` command |
| `--docker-check` | not installed | Opt in to `/docker-check` and the `docker-type-check` skill |
| `--gitignore <mode>` | prompted | `full` / `skills` / `output-only` / `none` — controls what gets added to `.gitignore` |

**Gitignore modes** (project installs only — global installs skip):
- `output-only` — ignore `_arcwright-output/` only (default / recommended)
- `skills` — also ignore `.agents/skills/` and `.kiro/skills/`
- `full` — ignore all Arcwright dirs, commands, and agent stubs
- `none` — do not modify `.gitignore`

The installer writes a managed `# ─── Arcwright installation ───` block to `.gitignore`. On update, that block is replaced in-place. It never commits to git.

**Global Install:**

Global installs write to user-level config dirs (`~/.arcwright/`, `~/.claude/`, `~/.kiro/`). On WSL2, terminal tools (Claude Code, Gemini) go to Linux home; GUI IDEs (Kiro, Cursor, etc.) go to Windows home.

| Target | Linux / macOS | Windows (WSL2) |
|--------|---------------|----------------|
| Core modules | `~/.arcwright/` | `~/.arcwright/` (WSL Linux home) |
| Claude Code assets | `~/.claude/` | `~/.claude/` (WSL Linux home) |
| Kiro assets | `~/.kiro/` | `/mnt/c/Users/<name>/.kiro/` |

Global update reads `~/.arcwright/_config/manifest.yaml`, removes orphaned files, and preserves user overlays and `config.yaml`. On `update --yes --global`, prior choices for `--tools`, `--teams`, and `--docker-check` are restored from the manifest automatically.

## Module Reference

| Module | Dir | Contents |
|--------|-----|----------|
| AWM (Method) | `_arcwright/awm/` | Specialist agents: analyst, architect, dev, pm, qa, sm, tech-writer, ux-designer |
| AWB (Builder) | `_arcwright/awb/` | Meta-agents for creating new agents, workflows, and modules |
| Core | `_arcwright/core/` | Master orchestrator agent, templates, core workflows |
| Memory | `_arcwright/_memory/` | Sidecar files, skill definitions |

## Relationship to Squidhub

This workshop is the **single publish source** for `@arcwright-ai/agent-orchestration`.

The Squidhub project keeps its own Squidhub-specific overlay files (squid-master persona, MCP templates, etc.) locally. These are **not published** — they sit on top of the installed Arcwright package for Squidhub's own use.

<!-- arcwright-agent-start -->

## Arcwright

Arcwright agents, skills, and workflows are installed in `_arcwright/`.
Key modules: awm, awb, core, _memory

To use an agent, load its `.md` file and follow its activation instructions.
Agent configs are in `_arcwright/{module}/config.yaml`.
Skills are in `.agents/skills/` and `_arcwright/_memory/skills/`.

<!-- arcwright-agent-end -->

<!-- arcwright-tmux-start -->

## Agent Spawning (tmux-aware)

If `$TMUX` is set, load `.agents/skills/tmux-protocol/SKILL.md` before any multi-pane work.

<!-- arcwright-tmux-end -->

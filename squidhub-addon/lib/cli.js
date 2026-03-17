#!/usr/bin/env node
/**
 * @devo-bmad-custom/squidhub — CLI
 */
'use strict';

const { Command } = require('commander');
const path = require('path');
const pkg = require('../package.json');

const program = new Command();

program
  .name('bmad-squidhub')
  .description('BMAD Squidhub Addon — installs squid-master, review agent, and Squidhub-specific configs into your project')
  .version(pkg.version);

// ─── install (default) ────────────────────────────────────────────────────────

program
  .command('install', { isDefault: true })
  .description('Install the Squidhub addon into the current project (requires base BMAD install first)')
  .option('-d, --directory <path>', 'Target project root', process.cwd())
  .option('-y, --yes', 'Skip interactive prompts', false)
  .addHelpText('after', `
Examples:
  # Interactive install
  npx @devo-bmad-custom/squidhub

  # Non-interactive
  npx @devo-bmad-custom/squidhub --yes

  # Install into a specific directory
  npx @devo-bmad-custom/squidhub --directory /path/to/project --yes

Requires base package installed first:
  npx @devo-bmad-custom/agent-orchestration
`)
  .action(async (opts) => {
    const { install } = require('./installer');
    await install(opts);
  });

// ─── update ───────────────────────────────────────────────────────────────────

program
  .command('update')
  .description('Update an existing Squidhub addon installation')
  .option('-d, --directory <path>', 'Target project root', process.cwd())
  .option('-y, --yes', 'Skip interactive prompts', false)
  .action(async (opts) => {
    const { install } = require('./installer');
    await install({ ...opts, action: 'update' });
  });

// ─── status ───────────────────────────────────────────────────────────────────

program
  .command('status')
  .description('Show Squidhub addon installation status')
  .option('-d, --directory <path>', 'Target project root', process.cwd())
  .action(async (opts) => {
    const { status } = require('./installer');
    await status(opts);
  });

program.parse();

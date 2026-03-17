'use strict';
/**
 * @devo-bmad-custom/squidhub — installer.js
 * Installs squid-master sidecar, review agent, and Squidhub module config
 * into the target project's _devo-bmad-custom/ directory.
 * Requires base @devo-bmad-custom/agent-orchestration to be installed first.
 */

const fs = require('fs-extra');
const path = require('path');
const { glob } = require('glob');

const SRC_DIR = path.join(__dirname, '..', 'src');

async function install(opts) {
  const {
    directory = process.cwd(),
    yes = false,
    action,
  } = opts;

  const isUpdate = action === 'update';
  const projectRoot = path.resolve(directory);
  const bmadDir = path.join(projectRoot, '_devo-bmad-custom');
  const chalk = (await import('chalk')).default;

  console.log(`\n${chalk.bold.cyan(isUpdate ? 'BMAD Squidhub Update' : 'BMAD Squidhub Install')}`);
  console.log(`  Target: ${chalk.cyan(projectRoot)}\n`);

  // Guard — base package must be installed first
  if (!await fs.pathExists(bmadDir)) {
    console.log(chalk.yellow('⚠  No _devo-bmad-custom/ found. Install the base package first:'));
    console.log(`  ${chalk.cyan('npx @devo-bmad-custom/agent-orchestration')}\n`);
    process.exit(1);
  }

  if (!yes) {
    const readline = require('readline');
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const answer = await new Promise(res => rl.question(
      chalk.yellow(`  ${isUpdate ? 'Update' : 'Install'} Squidhub addon? (Y/n): `), res
    ));
    rl.close();
    if (answer.toLowerCase().startsWith('n')) {
      console.log(chalk.dim('  Cancelled.\n'));
      return;
    }
  }

  // Copy all src/ files — route .claude/commands/ to project root, rest to _devo-bmad-custom/
  const files = await glob('**/*', { cwd: SRC_DIR, nodir: true });
  let copied = 0;
  let trackCommands = 0;

  for (const rel of files) {
    const src = path.join(SRC_DIR, rel);
    let dest;
    if (rel.startsWith('.claude/commands/')) {
      // Slash commands go to project root .claude/commands/, not inside _devo-bmad-custom/
      dest = path.join(projectRoot, rel);
    } else {
      dest = path.join(bmadDir, rel);
    }
    await fs.ensureDir(path.dirname(dest));
    await fs.copy(src, dest, { overwrite: true });
    copied++;
    if (rel.startsWith('.claude/commands/')) trackCommands++;
  }

  console.log(chalk.green(`  ✓ squid-master sidecar`));
  console.log(chalk.green(`  ✓ review-orchestrator agent`));
  console.log(chalk.green(`  ✓ squidhub module config`));
  if (trackCommands > 0) console.log(chalk.green(`  ✓ ${trackCommands} /bmad-track-* slash commands → .claude/commands/`));
  console.log(`\n${chalk.bold.green('✓ Done!')} ${copied} files ${isUpdate ? 'updated' : 'installed'}.`);
  console.log(`  Squidhub addon is ready at ${chalk.cyan('_devo-bmad-custom/')}\n`);
}

async function status(opts) {
  const { directory = process.cwd() } = opts;
  const projectRoot = path.resolve(directory);
  const bmadDir = path.join(projectRoot, '_devo-bmad-custom');
  const chalk = (await import('chalk')).default;

  const sidecarPath = path.join(bmadDir, '_memory', 'squid-master-sidecar', 'instructions.md');
  const squidhubPath = path.join(bmadDir, 'squidhub');

  console.log(chalk.bold.blue('\nBMAD Squidhub Addon Status'));
  console.log(`  squid-master sidecar:  ${await fs.pathExists(sidecarPath) ? chalk.green('✓ installed') : chalk.red('✗ not found')}`);
  console.log(`  squidhub module:       ${await fs.pathExists(squidhubPath) ? chalk.green('✓ installed') : chalk.red('✗ not found')}`);

  if (!await fs.pathExists(bmadDir)) {
    console.log(chalk.yellow('\n  Base BMAD not installed. Run: npx @devo-bmad-custom/agent-orchestration\n'));
  } else if (!await fs.pathExists(sidecarPath)) {
    console.log(chalk.yellow('\n  Addon not installed. Run: npx @devo-bmad-custom/squidhub\n'));
  } else {
    console.log(chalk.green('\n  Addon is up to date.\n'));
  }
}

module.exports = { install, status };

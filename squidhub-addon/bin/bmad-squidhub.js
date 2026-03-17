#!/usr/bin/env node
/**
 * @devo-bmad-custom/squidhub
 * Entry point — injects 'install' as default subcommand, delegates to CLI.
 */
'use strict';

const path = require('path');
const { execSync } = require('child_process');

const cliPath = path.join(__dirname, '..', 'lib', 'cli.js');
const isNpx = __dirname.includes('_npx') || __dirname.includes('.npm') || __dirname.includes('npx');

const SUBCOMMANDS = ['install', 'update', 'status'];
const userArgs = process.argv.slice(2);
const hasSubcommand = userArgs.length > 0 && SUBCOMMANDS.includes(userArgs[0]);
const effectiveArgs = hasSubcommand ? userArgs : ['install', ...userArgs];

if (isNpx) {
  const args = effectiveArgs.map(a => JSON.stringify(a)).join(' ');
  try {
    execSync(`node ${JSON.stringify(cliPath)} ${args}`, {
      cwd: process.cwd(),
      stdio: 'inherit',
      env: process.env,
    });
  } catch (e) {
    process.exit(e.status || 1);
  }
} else {
  process.argv = [process.argv[0], process.argv[1], ...effectiveArgs];
  require(cliPath);
}

#!/usr/bin/env node

import * as fs from 'node:fs';

import { formatJsonReport, formatTextReport } from './reporters';
import { scanPath } from './scanner';

function readOption(args: string[], name: string): string | undefined {
  const eq = args.find((arg) => arg.startsWith(`${name}=`));
  if (eq) return eq.split('=').slice(1).join('=');
  const index = args.indexOf(name);
  if (index >= 0 && index + 1 < args.length) return args[index + 1];
  return undefined;
}

function printUsage(): void {
  console.log('GitPrivacy Guard CLI\n\nUsage: gitprivacyguard <path> [--format text|json]\n');
}

const args = process.argv.slice(2);
if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
  printUsage();
  process.exit(0);
}

const target = args[0];
const format = (readOption(args, '--format') ?? 'text') as 'text' | 'json';

try {
  const result = scanPath(target, { ignorePatterns: ['node_modules', '.git', 'dist'] });
  const output = format === 'json' ? formatJsonReport(result) : formatTextReport(result);
  console.log(output);
  if (result.summary.findings > 0) process.exitCode = 1;
} catch (error) {
  const message = error instanceof Error ? error.message : 'Unknown error';
  console.error(`GitPrivacy Guard error: ${message}`);
  process.exit(1);
}

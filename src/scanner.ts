import * as fs from 'node:fs';
import * as path from 'node:path';

import { DEFAULT_RULES } from './rules';
import type { DetectionRule, Finding, ScanOptions, ScanResult, Severity } from './types';

const DEFAULT_IGNORE = ['node_modules', '.git', 'dist', 'coverage', 'vendor'];

function lineCol(source: string, index: number): { line: number; column: number } {
  const before = source.slice(0, index);
  const lines = before.split(/\r?\n/);
  return { line: lines.length, column: lines[lines.length - 1].length + 1 };
}

function shouldIgnore(filePath: string, ignore: string[]): boolean {
  const normalized = filePath.split(path.sep).join('/');
  return ignore.some((part) => normalized.includes(part));
}

function matchesForRule(content: string, rule: DetectionRule): Array<{ index: number; match: string }> {
  const regex = new RegExp(rule.pattern.source, rule.pattern.flags.includes('g') ? rule.pattern.flags : `${rule.pattern.flags}g`);
  const result: Array<{ index: number; match: string }> = [];
  let match: RegExpExecArray | null;
  while ((match = regex.exec(content)) !== null) {
    if (match[0] === '') regex.lastIndex += 1;
    result.push({ index: match.index, match: match[0] });
  }
  return result;
}

export function scanFile(filePath: string, options: ScanOptions = {}): Finding[] {
  const resolved = path.resolve(filePath);
  const content = fs.readFileSync(resolved, 'utf8');
  const ignore = [...DEFAULT_IGNORE, ...(options.ignorePatterns ?? [])];
  if (shouldIgnore(resolved, ignore)) return [];

  const fileName = path.basename(resolved);
  const findings: Finding[] = [];

  for (const rule of DEFAULT_RULES) {
    const shouldCheckFilename = rule.id === 'sensitive-file';
    if (shouldCheckFilename) {
      const fileMatch = new RegExp(rule.pattern).test(fileName);
      if (!fileMatch) continue;
      findings.push({
        ruleId: rule.id,
        label: rule.label,
        severity: rule.severity,
        file: resolved,
        line: 1,
        column: 1,
        evidence: fileName,
        recommendation: rule.recommendation
      });
      continue;
    }

    const matches = matchesForRule(content, rule);
    for (const item of matches) {
      const { line, column } = lineCol(content, item.index);
      findings.push({
        ruleId: rule.id,
        label: rule.label,
        severity: rule.severity,
        file: resolved,
        line,
        column,
        evidence: item.match.trim(),
        recommendation: rule.recommendation
      });
    }
  }

  return findings;
}

export function scanPath(targetPath: string, options: ScanOptions = {}): ScanResult {
  const resolved = path.resolve(targetPath);
  if (!fs.existsSync(resolved)) throw new Error(`Target path does not exist: ${resolved}`);

  const ignore = [...DEFAULT_IGNORE, ...(options.ignorePatterns ?? [])];
  const findings: Finding[] = [];
  let filesScanned = 0;

  function walk(current: string): void {
    if (shouldIgnore(current, ignore)) return;
    const entry = fs.statSync(current);
    if (entry.isDirectory()) {
      for (const child of fs.readdirSync(current)) walk(path.join(current, child));
      return;
    }
    if (!entry.isFile()) return;
    const maxSize = options.maxFileSizeBytes ?? 2_000_000;
    if (entry.size > maxSize) return;
    filesScanned += 1;
    findings.push(...scanFile(current, options));
  }

  walk(resolved);

  const sev: Severity[] = ['critical', 'high', 'medium', 'low', 'info'];
  const bySeverity = sev.reduce((acc, key) => ({ ...acc, [key]: 0 }), {} as Record<Severity, number>);
  for (const finding of findings) bySeverity[finding.severity] += 1;

  return {
    target: resolved,
    filesScanned,
    findings,
    summary: {
      filesScanned,
      findings: findings.length,
      bySeverity,
      target: resolved
    },
    generatedAt: new Date().toISOString()
  };
}

import test from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';

import { scanFile, scanPath } from '../src/scanner';
import { formatJsonReport } from '../src/reporters';

test('scanFile catches a hardcoded secret and sensitive file name', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gitprivacyguard-'));
  const secretFile = path.join(dir, '.env');
  fs.writeFileSync(secretFile, 'API_KEY="sk_live_secret_value_123456"');
  const findings = scanFile(secretFile);
  assert.ok(findings.some((item) => item.ruleId === 'api-secret'));
  assert.ok(findings.some((item) => item.ruleId === 'sensitive-file'));
});

test('scanPath reports severity counts and files scanned', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gitprivacyguard-scan-'));
  fs.mkdirSync(path.join(dir, 'nested'), { recursive: true });
  fs.writeFileSync(path.join(dir, 'notes.txt'), 'email=hello@example.com');
  fs.writeFileSync(path.join(dir, 'nested', '.env.local'), 'AWS_SECRET_ACCESS_KEY=supersecret');

  const result = scanPath(dir);
  assert.equal(result.filesScanned, 2);
  assert.ok(result.summary.findings >= 2);
  assert.ok(result.summary.bySeverity.critical >= 1);
  assert.ok(result.summary.bySeverity.high >= 1);
});

test('JSON report renders serializable output', () => {
  const result = {
    target: '/tmp/demo',
    filesScanned: 1,
    findings: [{
      ruleId: 'personal-data',
      label: 'Personal Data Pattern',
      severity: 'high',
      file: '/tmp/demo/test.txt',
      line: 2,
      column: 10,
      evidence: 'hello@example.com',
      recommendation: 'Redact it.'
    }],
    summary: {
      filesScanned: 1,
      findings: 1,
      bySeverity: { critical: 0, high: 1, medium: 0, low: 0, info: 0 },
      target: '/tmp/demo'
    },
    generatedAt: new Date().toISOString()
  } as any;

  const raw = formatJsonReport(result);
  assert.ok(raw.includes('"ruleId": "personal-data"'));
});

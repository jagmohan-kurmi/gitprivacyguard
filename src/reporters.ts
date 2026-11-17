import type { Finding, ScanResult } from './types';

export function formatTextReport(result: ScanResult): string {
  const lines: string[] = [];
  lines.push('GitPrivacy Guard scan report');
  lines.push(`Target: ${result.target}`);
  lines.push(`Files scanned: ${result.filesScanned}`);
  lines.push(`Findings: ${result.summary.findings}`);
  lines.push('');
  if (result.findings.length === 0) {
    lines.push('No sensitive data detected.');
    return lines.join('\n');
  }
  for (const finding of result.findings) {
    lines.push(`${finding.severity.toUpperCase()} | ${finding.label} | ${finding.file}:${finding.line}:${finding.column}`);
    lines.push(`  Rule: ${finding.ruleId}`);
    lines.push(`  Evidence: ${finding.evidence}`);
    lines.push(`  Recommendation: ${finding.recommendation}`);
    lines.push('');
  }
  return lines.join('\n').trim();
}

export function formatJsonReport(result: ScanResult): string {
  return JSON.stringify(result, null, 2);
}

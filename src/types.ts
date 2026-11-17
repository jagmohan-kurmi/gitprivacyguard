export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info';

export interface DetectionRule {
  id: string;
  label: string;
  description: string;
  severity: Severity;
  pattern: RegExp;
  recommendation: string;
}

export interface Finding {
  ruleId: string;
  label: string;
  severity: Severity;
  file: string;
  line: number;
  column: number;
  evidence: string;
  recommendation: string;
}

export interface ScanSummary {
  filesScanned: number;
  findings: number;
  bySeverity: Record<Severity, number>;
  target: string;
}

export interface ScanResult {
  target: string;
  filesScanned: number;
  findings: Finding[];
  summary: ScanSummary;
  generatedAt: string;
}

export interface ScanOptions {
  ignorePatterns?: string[];
  maxFileSizeBytes?: number;
}

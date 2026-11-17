import type { DetectionRule } from './types';

export const DEFAULT_RULES: DetectionRule[] = [
  {
    id: 'api-secret',
    label: 'API Secret Pattern',
    description: 'Looks like an API key, token, or secret material embedded in a file.',
    severity: 'critical',
    pattern: /(?:api[_-]?key|secret|token|access[_-]?token|client[_-]?secret)\s*[:=]\s*["'`][A-Za-z0-9_\-./=+:]{12,}["'`]/gi,
    recommendation: 'Move the secret to a secure secret manager and keep it out of source control.'
  },
  {
    id: 'personal-data',
    label: 'Personal Data Pattern',
    description: 'String appears to contain personal or sensitive identity information.',
    severity: 'high',
    pattern: /(?:\b[A-Z][a-z]+\s+[A-Z][a-z]+\b.*\b(?:email|phone|mobile|contact)\b|\b(?:[A-Za-z0-9._%+-]+)@(?:[A-Za-z0-9.-]+\.[A-Za-z]{2,})\b|\b\d{10,}\b)/gi,
    recommendation: 'Redact or anonymize the information and verify that storage and display are approved.'
  },
  {
    id: 'aws-secret',
    label: 'Cloud Credential Pattern',
    description: 'Looks like a cloud credential or AWS-style key material.',
    severity: 'critical',
    pattern: /(?:AKIA|ASIA)[A-Z0-9]{12,}|(?:aws_access_key_id|aws_secret_access_key)\s*[:=]/gi,
    recommendation: 'Remove keys from the repository and rotate them in the provider console.'
  },
  {
    id: 'private-key',
    label: 'Private Key Material',
    description: 'Private key or certificate content detected in a tracked file.',
    severity: 'critical',
    pattern: /-----BEGIN (?:RSA |EC |OPENSSH |PGP )?(?:PRIVATE KEY|CERTIFICATE)-----/gi,
    recommendation: 'Store private keys only in approved secure vaults and exclude them from source control.'
  },
  {
    id: 'sensitive-file',
    label: 'Sensitive File Name',
    description: 'The file name matches a sensitive or environment file commonly used for credentials.',
    severity: 'medium',
    pattern: /(?:^|\/)(?:\.env|\.env\.[A-Za-z0-9_-]+|\.pem|\.p12|\.pfx|\.key|id_rsa|id_dsa|secrets\.json|credentials\.json)$/,
    recommendation: 'Keep sensitive files outside the repository or enforce a strict allowlist.'
  }
];

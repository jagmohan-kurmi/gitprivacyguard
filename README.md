# GitPrivacy Guard

GitPrivacy Guard is a local-first privacy scanner designed to catch secrets, personal data and sensitive files before they are committed or shipped.

## Features
- API secret detection
- Personal information detection
- Sensitive file detection
- Git history-friendly local scanning workflow
- CI/CD-compatible output
- Redacted results and configurable ignore rules

## Installation

```bash
npm install @jagmohan-kurmi/gitprivacyguard
```

## Quick start

```bash
npx gitprivacyguard . --format text
```

## Security note
This tool helps flag risky patterns, but it does not replace a full secret-management and governance process.

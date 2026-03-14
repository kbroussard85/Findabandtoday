# Security Policy

## Supported Versions

Currently, only the latest branch is supported for security updates.

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |
| < 0.1   | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability within Findabandtoday (FABT), please report it responsibly.

### How to report
- Please do **not** open a public GitHub issue for security vulnerabilities.
- Send a detailed report to the maintainers (e.g., via the GitHub repository's security advisory feature or a specified email if available).
- We will acknowledge your report within 48 hours and provide updates on the fix.

### Recent Security Hardening
The following measures have been recently implemented:
- **Insecure Direct Object Reference (IDOR)** protection on all sensitive API routes (Escrow, Gigs).
- **File Upload Validation**: MIME type, file size, and magic byte verification for all media uploads.
- **Centralized Middleware Authentication**: A unified layer ensuring all protected routes require valid sessions.
- **API Key Security**: Removed all hardcoded keys and implemented explicit environment variable checks.

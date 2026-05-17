# Lexguard Web

The web app is a Vite, React, TanStack Router, React Query, and Zustand client for the Lexguard contract intelligence platform.

## Responsibilities

- Authenticate users against `/api/v1/auth/*`.
- Protect dashboard, contract, upload, compare, and settings routes.
- Upload legal documents and import public legal URLs.
- Show clause-level risk findings, explanations, scenario implications, negotiation tips, chat, reports, and comparison output.

## Local Development

```bash
bun install
VITE_API_URL=http://localhost:3001/api/v1 bun --filter @lexguard/web dev
```

The API must be running for authenticated product routes.

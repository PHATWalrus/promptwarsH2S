# LEXGUARD API Reference

Base path: `/api/v1`

## Auth

- `POST /auth/register` creates a Better Auth user, organization membership, and returns `{ user, accessToken, refreshToken }`.
- `POST /auth/login` verifies Better Auth credentials and returns LEXGUARD JWTs.
- `POST /auth/refresh` rotates refresh tokens through the Redis allowlist.
- `POST /auth/logout` revokes a refresh token.
- `GET /auth/me` returns the current authenticated user.

## Contracts

- `POST /contracts/upload` accepts multipart PDF, DOCX, or text contracts up to 10 MB.
- `POST /contracts/import-url` imports public terms or privacy-policy pages through Browser Run, Firecrawl, or manual fetch.
- `GET /contracts` lists tenant-scoped contracts.
- `GET /contracts/:id` returns metadata.
- `DELETE /contracts/:id` soft deletes and audits the contract.

## Analysis, Clauses, Chat, Reports

- `POST /analysis/:contractId/trigger` enqueues a fresh analysis pipeline.
- `GET /analysis/:contractId/status` returns polling progress.
- `GET /analysis/:contractId/result` returns risk summary, clauses, privacy flags, and explanation output.
- `GET /clauses/contracts/:id/clauses`, `GET /clauses/:clauseId`, `PATCH /clauses/:clauseId/feedback`, and `GET /clauses/search` expose clause intelligence.
- `POST /chat/:contractId/message` streams an SSE response using RAG over relevant clauses.
- `GET /reports/:contractId` returns JSON or PDF based on `Accept`.
- `POST /compare` returns a key-term comparison matrix for 2 to 5 contracts.

OpenAPI JSON is available at `/openapi.json`; Swagger UI is available at `/docs` in development.

# Lexguard

Lexguard is an AI Rights and Contract Intelligence System for **Problem Statement 01**. It helps users analyze legal and quasi-legal agreements before accepting them by extracting important clauses, scoring risk, explaining practical implications, and producing interpretable reports.

## What It Does

- Upload PDF, DOCX, or text contracts, or import public terms/privacy-policy URLs.
- Extract meaningful clauses for obligations, privacy, payment, employment, IP, arbitration, liability, renewal, termination, and related risks.
- Score clauses with deterministic safeguards plus Gemini-powered reasoning.
- Explain real-world consequences in plain language with negotiation tips.
- Run privacy/compliance review and scenario Q&A over relevant clauses.
- Compare selected contracts against standard benchmark language.
- Generate JSON/PDF risk reports with a legal-information disclaimer.

## Architecture

- `apps/web`: Vite React dashboard.
- `apps/api`: Hono API with Better Auth identity, Lexguard JWTs, tenant isolation, upload guards, URL import protection, and reports.
- `apps/worker`: BullMQ analysis worker for ingest, extraction, risk, privacy, explanation, and reporting.
- `packages/db`: Drizzle/Postgres/pgvector schema.
- `packages/ai`: Gemini client, prompts, embeddings, and RAG utilities.
- `packages/types`: shared Zod request/response contracts.

## Local Verification

```bash
bun test
bun run typecheck
bun run lint
bun run build
docker compose config --quiet
```

For full product smoke testing, start Postgres, Redis, and MinIO with `docker compose up -d`, run migrations, start API/web/worker services, then upload or import a sample agreement.

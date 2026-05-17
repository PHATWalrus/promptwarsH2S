# LEXGUARD Architecture

LEXGUARD is a backend-only Bun monorepo for AI-powered contract intelligence. The API is a Hono service, the background analyzer is a separate BullMQ worker, and shared packages hold database schema, type contracts, and AI/RAG utilities.

## Core Flow

1. Users authenticate through Better Auth-backed email/password identity. LEXGUARD issues short-lived access JWTs and Redis-allowlisted refresh JWTs for the `/api/v1` contract.
2. Users upload PDF, DOCX, text, or import a public legal page URL. Uploads are MIME and magic-byte checked, hashed, virus-scan hooked, and stored in S3-compatible storage.
3. The API creates a tenant-scoped contract and analysis job, then enqueues BullMQ work.
4. The worker runs ingest, extract, risk, privacy, explain, and report stages with retry/backoff and progress reporting.
5. Results are stored in PostgreSQL with pgvector embeddings for semantic clause search.

## AI And Crawling

Gemini is the default model provider. Embeddings use `gemini-embedding-001` with `outputDimensionality: 1536` to match the pgvector schema. URL imports try Cloudflare Browser Run first, then Firecrawl, then manual HTML text extraction.

## Security

Every authenticated data path must include user or organization scoping. Mutating operations write audit events. Validation is strict Zod. Errors are returned as RFC 7807 Problem Details without stack traces. CORS is allowlisted and production never uses wildcard origins.

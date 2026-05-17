# LEXGUARD Architecture

LEXGUARD is a Bun monorepo for AI-powered contract intelligence. It includes a Vite React dashboard, a Hono API, a separate BullMQ analysis worker, and shared packages for database schema, type contracts, and AI/RAG utilities.

## Core Flow

1. Users authenticate through Better Auth-backed email/password identity. LEXGUARD issues short-lived access JWTs and Redis-allowlisted refresh JWTs for the `/api/v1` contract.
2. Users upload PDF, DOCX, text, or import a public legal page URL. Uploads are MIME and magic-byte checked, hashed, scanned through the configured upload scanner, and stored in S3-compatible storage.
3. The API creates a tenant-scoped contract and analysis job, then enqueues BullMQ work.
4. The worker runs ingest, extract, risk, privacy, explain, and report stages with retry/backoff and progress reporting. Scanned PDFs can be sent to a configured OCR service and the analysis metadata records whether OCR was needed or used.
5. Results are stored in PostgreSQL with pgvector embeddings for semantic clause search and scenario Q&A retrieval.

## AI And Crawling

Gemini is the default model provider. Embeddings use `gemini-embedding-001` with `outputDimensionality: 1536` to match the pgvector schema. URL imports validate the target against SSRF controls, then try Cloudflare Browser Run, Firecrawl, or manual HTML text extraction according to configuration.

## Security

Every authenticated data path must include organization scoping. Mutating operations write audit events. Validation is strict Zod. Errors are returned as RFC 7807 Problem Details without stack traces. CORS is allowlisted and production never uses wildcard origins. Production also requires HTTPS API/storage endpoints, real secrets, a non-disabled upload scanner, and separate JWT access/refresh secrets.

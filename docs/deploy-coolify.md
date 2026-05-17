# Deploy Lexguard to Coolify

This guide deploys Lexguard as three Coolify Nixpacks applications from the same repository:

- `lexguard-api`: Hono API, port `3001`, uses `nixpacks.toml`
- `lexguard-worker`: BullMQ analysis worker, no public domain, uses `nixpacks.worker.toml`
- `lexguard-web`: Vite static site, publish directory `apps/web/dist`, uses `nixpacks.web.toml`

Shared services are Postgres with pgvector, Redis, and Cloudflare R2 for contract storage.

## 1. Create Shared Services

### Postgres with pgvector

Create a Coolify database/service using the image `pgvector/pgvector:pg16`.

Use these settings:

- Database: `lexguard`
- User: `lexguard`
- Password: generate a strong password in Coolify
- Internal host: use the service name Coolify assigns, for example `postgres`
- Port: `5432`

The app expects this URL format:

```env
DATABASE_URL=postgresql://lexguard:<password>@<postgres-service-name>:5432/lexguard
```

If Coolify's one-click Postgres service cannot use the `pgvector/pgvector:pg16` image, create a small custom Docker Compose database resource for Postgres and Redis, then point the three applications at that internal network host.

### Redis

Create a Coolify Redis service.

Use this URL format:

```env
REDIS_URL=redis://<redis-service-name>:6379
```

If Redis auth is enabled, use:

```env
REDIS_URL=redis://:<password>@<redis-service-name>:6379
```

### Cloudflare R2

In Cloudflare:

1. Open R2 and create a bucket, for example `lexguard-contracts`.
2. Copy the Cloudflare account ID.
3. Create an R2 API token with read/write access to the bucket.
4. Use the S3-compatible endpoint:

```env
STORAGE_ENDPOINT=https://<cloudflare-account-id>.r2.cloudflarestorage.com
STORAGE_BUCKET=lexguard-contracts
STORAGE_REGION=auto
STORAGE_FORCE_PATH_STYLE=false
STORAGE_ACCESS_KEY=<r2-access-key-id>
STORAGE_SECRET_KEY=<r2-secret-access-key>
```

## 2. Create the API Application

Create a new Coolify application from the Git repo.

Settings:

- Build Pack: `Nixpacks`
- Base Directory: `/`
- Config file: default root `nixpacks.toml`
- Port: `3001`
- Health check path: `/api/v1/health`
- Domain: `https://api.your-domain.com`

Add these environment variables. API secrets can be runtime-only because the API build only typechecks; `NODE_ENV` can be build and runtime.

```env
NODE_ENV=production
PORT=3001
API_VERSION=v1
API_BASE_URL=https://api.your-domain.com
ALLOWED_ORIGINS=https://your-domain.com

DATABASE_URL=postgresql://lexguard:<password>@<postgres-service-name>:5432/lexguard
DATABASE_MAX_CONNECTIONS=20

REDIS_URL=redis://<redis-service-name>:6379
REDIS_KEY_PREFIX=lexguard:

STORAGE_ENDPOINT=https://<cloudflare-account-id>.r2.cloudflarestorage.com
STORAGE_ACCESS_KEY=<r2-access-key-id>
STORAGE_SECRET_KEY=<r2-secret-access-key>
STORAGE_BUCKET=lexguard-contracts
STORAGE_REGION=auto
STORAGE_FORCE_PATH_STYLE=false

BETTER_AUTH_SECRET=<openssl-rand-base64-48>
JWT_ACCESS_SECRET=<different-openssl-rand-base64-48>
JWT_REFRESH_SECRET=<different-openssl-rand-base64-48>
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d

GEMINI_API_KEY=<google-ai-studio-api-key>
GEMINI_SEARCH_GROUNDING=true
DEFAULT_LLM_MODEL=gemini-2.5-flash
GEMINI_EMBEDDING_MODEL=gemini-embedding-001

CRAWL_PROVIDER=manual
CLOUDFLARE_ACCOUNT_ID=
CLOUDFLARE_API_TOKEN=
FIRECRAWL_API_KEY=

RATE_LIMIT_UPLOAD_PER_HOUR=10
RATE_LIMIT_CHAT_PER_HOUR=30
WORKER_CONCURRENCY=5
ANALYSIS_TIMEOUT_MS=120000
```

Generate secrets locally:

```bash
openssl rand -base64 48
```

The API refuses to boot in production if `ALLOWED_ORIGINS=*`, `API_BASE_URL` is not HTTPS, `STORAGE_ENDPOINT` is not HTTPS, placeholder secrets are used, or the JWT access and refresh secrets match. Keep `ALLOWED_ORIGINS` as an exact comma-separated allow-list of deployed web origins; do not use wildcards for previews or production.

## 3. Create the Worker Application

Create a second Coolify application from the same Git repo.

Settings:

- Build Pack: `Nixpacks`
- Base Directory: `/`
- Config file: `nixpacks.worker.toml`
- Public domain: disabled
- Health check: disabled, or use Coolify's basic container liveness check

If Coolify does not expose a config-file field, set this environment variable:

```env
NIXPACKS_CONFIG_FILE=nixpacks.worker.toml
```

Add these runtime variables:

```env
NODE_ENV=production
DATABASE_URL=postgresql://lexguard:<password>@<postgres-service-name>:5432/lexguard
REDIS_URL=redis://<redis-service-name>:6379
WORKER_CONCURRENCY=5
ANALYSIS_TIMEOUT_MS=120000

GEMINI_API_KEY=<google-ai-studio-api-key>
GEMINI_SEARCH_GROUNDING=true
DEFAULT_LLM_MODEL=gemini-2.5-flash
GEMINI_EMBEDDING_MODEL=gemini-embedding-001

STORAGE_ENDPOINT=https://<cloudflare-account-id>.r2.cloudflarestorage.com
STORAGE_ACCESS_KEY=<r2-access-key-id>
STORAGE_SECRET_KEY=<r2-secret-access-key>
STORAGE_BUCKET=lexguard-contracts
STORAGE_REGION=auto
STORAGE_FORCE_PATH_STYLE=false
```

Scale workers horizontally by creating more worker resources with the same env vars. Keep the same Redis and Postgres URLs so all workers consume the same `analysis` queue.

The worker also refuses to boot in production if `STORAGE_ENDPOINT` is not HTTPS or placeholder Gemini/R2 credentials are used.

## 4. Create the Web Application

Create a third Coolify application from the same Git repo.

Settings:

- Build Pack: `Nixpacks`
- Base Directory: `/`
- Config file: `nixpacks.web.toml`
- Static Site: enabled
- Publish Directory: `apps/web/dist`
- Domain: `https://your-domain.com`

If Coolify does not expose a config-file field, set:

```env
NIXPACKS_CONFIG_FILE=nixpacks.web.toml
```

The web app needs `VITE_API_URL` at build time because Vite embeds it into the static bundle. Use the HTTPS API URL only:

```env
VITE_API_URL=https://api.your-domain.com/api/v1
```

In Coolify, keep `VITE_API_URL` enabled as a build variable. Runtime is harmless but not required for the static bundle.

## 5. Run Migrations

After Postgres is available and before opening the app to users, run:

```bash
bun run db:migrate
```

In Coolify, run it from the API application terminal or as a one-off command with the API environment variables loaded.

## 6. Deploy Order

1. Deploy Postgres and Redis.
2. Create the R2 bucket and API token.
3. Deploy the API application.
4. Run `bun run db:migrate`.
5. Deploy the worker application.
6. Deploy the web application.
7. Confirm API CORS includes the final web domain in `ALLOWED_ORIGINS`.

## 7. Smoke Checks

Run these after deployment:

```bash
curl https://api.your-domain.com/api/v1/health
curl https://api.your-domain.com/api/v1/health/deep
```

Expected:

- `/health` returns HTTP 200 with `{"status":"ok"}`.
- `/health/deep` returns HTTP 200 when Postgres, Redis, queue, and R2 are reachable.

Then verify product flows:

- Register a user from the web app.
- Upload or import a contract.
- Confirm a job appears in Redis/BullMQ and the worker logs show `LEXGUARD worker started`.
- Confirm analysis progresses through extraction, scoring, privacy, explanation, and report stages.
- Ask a chat question that benefits from current legal context. Gemini calls are sent with Google Search grounding enabled by `GEMINI_SEARCH_GROUNDING=true`; a live API response from Gemini may include `groundingMetadata` when the model performs a search.
- JSON analysis jobs also send the `googleSearch` tool when grounding is enabled. The client intentionally omits strict `responseMimeType=application/json` for grounded JSON prompts because Gemini 2.5 rejects tool use combined with JSON MIME mode; the existing JSON prompts and parsers still enforce structured output.

## References

- Gemini Grounding with Google Search: https://ai.google.dev/gemini-api/docs/grounding/
- Coolify Nixpacks: https://coolify.io/docs/builds/packs/nixpacks
- Coolify environment variables: https://coolify.io/docs/knowledge-base/environment-variables
- Nixpacks configuration file: https://nixpacks.com/docs/configuration/file

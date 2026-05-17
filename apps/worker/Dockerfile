FROM oven/bun:1.3.14-alpine

WORKDIR /app
COPY package.json bun.lock turbo.json biome.json ./
COPY apps ./apps
COPY packages ./packages
RUN bun install --frozen-lockfile
RUN bun --filter @lexguard/worker run build

CMD ["bun", "--filter", "@lexguard/worker", "run", "start"]

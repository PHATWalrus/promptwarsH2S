FROM oven/bun:1.3.14-alpine

WORKDIR /app
COPY package.json bun.lock turbo.json biome.json ./
COPY apps ./apps
COPY packages ./packages
RUN bun install --frozen-lockfile

EXPOSE 3001
CMD ["bun", "--filter", "@lexguard/api", "run", "dev"]

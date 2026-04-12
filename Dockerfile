# Stage 1: Build
FROM oven/bun:latest AS builder
WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .
RUN bun run build

# Stage 2: Runner
FROM oven/bun:latest
WORKDIR /app

# TanStack Start outputs to .output by default
COPY --from=builder /app/.output ./.output
COPY --from=builder /app/package.json ./

EXPOSE 3000

# Run the compiled Nitro server in production mode
CMD ["bun", "run", ".output/server/index.mjs"]

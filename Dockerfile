# Build stage
FROM node:20-bookworm-slim AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage (with ffmpeg for Prática de fala / Reading)
FROM node:20-bookworm-slim AS runner

RUN apt-get update && apt-get install -y --no-install-recommends ffmpeg curl \
  && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
WORKDIR /app

COPY --from=builder /app/package.json /app/package-lock.json* ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/drizzle.config.ts ./
COPY --from=builder /app/src ./src

EXPOSE 3000
CMD ["sh", "-c", "npx drizzle-kit migrate && npx next start"]

# Dockerfile — Next.js + Prisma for Railway

FROM node:20-bookworm-slim AS builder
WORKDIR /app

# Prisma needs openssl
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# Install ALL deps (dev deps needed for build: prisma/typescript/etc)
COPY package.json package-lock.json* ./
RUN npm ci

# Copy source
COPY . .

# Never ship local env
RUN rm -f .env .env.* || true

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Build (use local binaries via npx)
RUN npx prisma generate && npx next build


FROM node:20-bookworm-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copy runtime artifacts
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next

# public folder may not exist — create it
RUN mkdir -p ./public
COPY --from=builder /app/public ./public

COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/next.config.mjs ./next.config.mjs

EXPOSE 3000

# Migrate + seed (seed safe) then start
CMD ["sh","-c","npx prisma migrate deploy || true; node prisma/seed.mjs || true; npx next start -p ${PORT:-3000}"]
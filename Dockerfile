# Dockerfile (Railway) — multi-stage, Prisma generate, no .env inside image
FROM node:20-bookworm-slim AS builder

WORKDIR /app

# Prisma needs openssl
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# deps
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# source
COPY . .

# IMPORTANT: never ship local env into image
RUN rm -f .env .env.* || true

# build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
RUN npx prisma generate && next build


FROM node:20-bookworm-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# copy only runtime artifacts
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
# public folder may be absent — create empty + copy if exists in repo
RUN mkdir -p ./public
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/next.config.mjs ./next.config.mjs

# Railway provides PORT
EXPOSE 3000

CMD ["sh","-c","npx prisma migrate deploy || true; node prisma/seed.mjs || true; next start -p ${PORT:-3000}"]
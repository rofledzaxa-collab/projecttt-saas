# ---- deps ----
  FROM node:20-bookworm-slim AS deps
  WORKDIR /app
  RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*
  COPY package.json package-lock.json* ./
  RUN npm ci
  
  # ---- builder ----
  FROM node:20-bookworm-slim AS builder
  WORKDIR /app
  RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*
  COPY --from=deps /app/node_modules ./node_modules
  COPY . .
  ENV NEXT_TELEMETRY_DISABLED=1
  ENV NODE_ENV=production
  RUN npm run build
  
  # ---- runner ----
  FROM node:20-bookworm-slim AS runner
  WORKDIR /app
  RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*
  ENV NODE_ENV=production
  ENV NEXT_TELEMETRY_DISABLED=1
  
  COPY --from=builder /app/package.json ./package.json
  COPY --from=builder /app/node_modules ./node_modules
  COPY --from=builder /app/.next ./.next
  COPY --from=builder /app/public ./public
  COPY --from=builder /app/prisma ./prisma
  COPY --from=builder /app/next.config.mjs ./next.config.mjs
  
  EXPOSE 3000
  CMD ["sh","-lc","npx prisma generate && npx next start -p ${PORT:-3000}"]
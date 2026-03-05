FROM node:20-bookworm-slim

WORKDIR /app

# Prisma needs openssl
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# Install deps (INCLUDING dev deps) because we run next build in Docker
COPY package.json package-lock.json* ./
RUN npm ci

# Copy source
COPY . .

# Never ship local env into image
RUN rm -f .env .env.* || true

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN npm run build

# Optional: shrink image after build
RUN npm prune --omit=dev

EXPOSE 3000
CMD ["npm","start"]
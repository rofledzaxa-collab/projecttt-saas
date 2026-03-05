FROM node:20-bookworm-slim

WORKDIR /app

# --- install system deps for prisma ---
RUN apt-get update && apt-get install -y --no-install-recommends \
  openssl \
  ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# --- deps ---
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# --- source ---
COPY . .

# IMPORTANT: do NOT ship local env into image
RUN rm -f .env .env.* || true

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Build (also generates prisma client because it's in your build script)
RUN npm run build

EXPOSE 3000
CMD ["npm","start"]
FROM node:20-bookworm-slim

WORKDIR /app

# Needed for Prisma + TLS
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# Install deps
COPY package.json package-lock.json* ./
RUN npm ci

# Copy source
COPY . .

# Build (includes prisma generate via package.json)
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
RUN npm run build

# Railway sets PORT automatically
EXPOSE 3000

CMD ["npm","start"]
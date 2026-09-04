# ==========================================
# Stage 1: Builder
# ==========================================
FROM node:24-slim AS builder
WORKDIR /app

# Leverage layer caching: only reinstall if package files change
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# RUN corepack enable && corepack prepare pnpm@latest --activate

# ==========================================
# Stage 2: Production dependencies
# ==========================================
FROM node:24-slim AS prod-deps
WORKDIR /app

# Fresh install of production deps only (avoids fragile `npm prune`)
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# ==========================================
# Stage 3: Runner
# ==========================================
FROM node:24-slim AS runner
WORKDIR /app

# Install gosu so docker-entrypoint.sh can run as node instead of root
RUN apt-get update && apt-get install -y gosu && rm -rf /var/lib/apt/lists/*

COPY --from=prod-deps --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/dist ./dist
COPY --from=builder --chown=node:node /app/package.json ./
COPY --from=builder --chown=node:node /app/start-server.js ./
COPY --from=builder --chown=node:node /app/migrate-up.js ./
COPY --from=builder --chown=node:node /app/docker-entrypoint.sh ./

ENV NODE_ENV=production
ENV APP_MODE=production
ENV HOST=0.0.0.0

# Run as root initially so the entrypoint can chown dirs, 
# then the entrypoint drops privileges to 'node' using gosu.
ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "./start-server.js"]


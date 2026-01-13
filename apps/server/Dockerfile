# Stage 1: Dependencies
FROM node:24-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
RUN corepack enable pnpm

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/server/package.json ./apps/server/
COPY packages/database/package.json ./packages/database/

RUN pnpm install --frozen-lockfile

# Stage 2: Builder
FROM node:24-alpine AS builder
WORKDIR /app
RUN corepack enable pnpm

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/server/node_modules ./apps/server/node_modules
COPY --from=deps /app/packages/database/node_modules ./packages/database/node_modules

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY packages/database ./packages/database
COPY packages/typescript-config ./packages/typescript-config
COPY apps/server ./apps/server

RUN pnpm --filter @repo/database build
RUN pnpm --filter server build

# Stage 3: Runner
FROM node:24-alpine AS runner
WORKDIR /app
RUN corepack enable pnpm

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

COPY --chown=nestjs:nodejs package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY --chown=nestjs:nodejs apps/server/package.json ./apps/server/
COPY --chown=nestjs:nodejs packages/database/package.json ./packages/database/

# CHANGE 1: Add --shamefully-hoist
RUN pnpm install --frozen-lockfile --prod --shamefully-hoist

COPY --from=builder --chown=nestjs:nodejs /app/packages/database/dist ./packages/database/dist
COPY --from=builder --chown=nestjs:nodejs /app/packages/database/package.json ./packages/database/
COPY --from=builder --chown=nestjs:nodejs /app/apps/server/dist ./apps/server/dist

USER nestjs
EXPOSE 3000
ENV NODE_ENV=production

CMD ["node", "apps/server/dist/src/main.js"]

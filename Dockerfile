# syntax=docker/dockerfile:1
FROM node:24-alpine AS base

RUN corepack enable && corepack prepare pnpm@11.13.0 --activate

WORKDIR /app

# ---- Dependencies Stage ----
FROM base AS deps

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
    --mount=type=cache,target=/root/.cache \
    pnpm install --frozen-lockfile

# ---- Build Stage ----
FROM base AS build

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN pnpm build

# ---- Production Dependencies Stage ----
FROM base AS prod-deps

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
    --mount=type=cache,target=/root/.cache \
    pnpm install --prod --frozen-lockfile --filter <package-name>... && \
    pnpm store prune

# ---- Release Stage ----
FROM base AS release

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

USER node

COPY --chown=node:node --from=prod-deps /app/node_modules ./node_modules
COPY --chown=node:node --from=build /app/dist ./dist
COPY --chown=node:node package.json ./

CMD ["node", "dist/main"]
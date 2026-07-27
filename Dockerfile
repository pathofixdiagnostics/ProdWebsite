# ────────────────────────────────────────────────────────────────
# PathoFix Diagnostics — API server image (Fly.io / Docker / local)
# Builds the Express API from the pnpm workspace into a small runtime.
# ────────────────────────────────────────────────────────────────

# ---- Build stage -------------------------------------------------
FROM node:24-slim AS build

# pnpm v10 matches lockfileVersion 9.0
RUN npm install -g pnpm@10

WORKDIR /app

# All workspace manifests first, so pnpm sees the full workspace and the
# frozen lockfile validates. Source is copied afterwards for better caching.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc tsconfig.base.json tsconfig.json ./
COPY lib/api-zod/package.json ./lib/api-zod/
COPY lib/api-client-react/package.json ./lib/api-client-react/
COPY lib/api-spec/package.json ./lib/api-spec/
COPY lib/db/package.json ./lib/db/
COPY artifacts/api-server/package.json ./artifacts/api-server/
COPY artifacts/krishnagiri-lab/package.json ./artifacts/krishnagiri-lab/
COPY artifacts/mockup-sandbox/package.json ./artifacts/mockup-sandbox/
COPY scripts/package.json ./scripts/

# Install only the api-server package and its workspace dependencies
RUN pnpm install --frozen-lockfile --filter "@workspace/api-server..."

# Now the source the API actually needs
COPY lib ./lib
COPY artifacts/api-server ./artifacts/api-server

# Bundle with esbuild → artifacts/api-server/dist/index.mjs
RUN pnpm --filter @workspace/api-server run build

# ---- Runtime stage ----------------------------------------------
FROM node:24-slim

ENV NODE_ENV=production
# Mirror the build-time path so esbuild-plugin-pino's hardcoded absolute
# worker path (/app/artifacts/api-server/dist/thread-stream-worker.mjs) resolves.
WORKDIR /app/artifacts/api-server

COPY --from=build /app/artifacts/api-server/dist ./dist

# nodemailer is intentionally NOT bundled by esbuild (see build.mjs
# externals), so it must exist in node_modules at runtime.
RUN npm install --omit=dev --no-audit --no-fund nodemailer@8

# Fly/compose inject PORT; default to 8080 for a bare `docker run`
ENV PORT=8080
EXPOSE 8080

CMD ["node", "--enable-source-maps", "dist/index.mjs"]

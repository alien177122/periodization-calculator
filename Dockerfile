FROM node:24-bookworm-slim AS build

WORKDIR /app

COPY package.json package-lock.json ./
COPY packages/shared/package.json ./packages/shared/package.json
RUN npm ci

COPY App.tsx index.html index.tsx vite.config.ts eslint.config.js postcss.config.js tsconfig.base.json tsconfig.json tsconfig.app.json tsconfig.node.json ./
COPY packages/shared ./packages/shared
COPY public ./public
COPY src ./src
COPY server ./server

RUN npm run build
RUN npm prune --omit=dev

FROM node:24-bookworm-slim AS runtime

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001
ENV DB_PATH=/app/data/gym.db
ENV WORKSPACE_FILES_ROOT=/app/workspace-files

COPY --from=build /app/package.json /app/package-lock.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/server ./server
COPY --from=build /app/dist ./dist

RUN mkdir -p /app/data /app/workspace-files/inbox /app/workspace-files/analysis \
  && chown -R node:node /app/data /app/workspace-files

# Audit 2026-11-07: run as the non-root node user.
USER node

EXPOSE 3001

VOLUME ["/app/data", "/app/workspace-files"]

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3001/api/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["node", "server/index.js"]

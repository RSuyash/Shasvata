FROM node:22-alpine AS runtime
WORKDIR /repo
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json tsconfig.base.json eslint.config.js ./
COPY packages ./packages
COPY db/fixtures ./db/fixtures
COPY apps/admin ./apps/admin
RUN pnpm install --frozen-lockfile=false
RUN pnpm --filter @shasvata/admin... build
EXPOSE 3004
CMD ["pnpm", "--filter", "@shasvata/admin", "start"]

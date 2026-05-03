FROM node:22-alpine AS runtime
WORKDIR /repo
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json tsconfig.base.json eslint.config.js ./
COPY packages ./packages
COPY db/fixtures ./db/fixtures
COPY apps/intelligence ./apps/intelligence
RUN pnpm install --frozen-lockfile=false
RUN pnpm --filter @shasvata/intelligence... build
EXPOSE 3002
CMD ["pnpm", "--filter", "@shasvata/intelligence", "start"]

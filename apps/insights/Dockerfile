FROM node:22-alpine AS runtime
WORKDIR /repo
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json tsconfig.base.json eslint.config.js ./
COPY packages ./packages
COPY apps/insights ./apps/insights
RUN pnpm install --frozen-lockfile=false
RUN pnpm --filter @shasvata/insights... build
EXPOSE 3001
CMD ["pnpm", "--filter", "@shasvata/insights", "start"]

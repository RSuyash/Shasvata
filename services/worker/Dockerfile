FROM node:22-alpine AS runtime
WORKDIR /repo
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json tsconfig.base.json eslint.config.js ./
COPY services/worker ./services/worker
RUN pnpm install --frozen-lockfile=false
RUN pnpm --filter @shasvata/worker build
CMD ["pnpm", "--filter", "@shasvata/worker", "start"]

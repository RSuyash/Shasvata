FROM node:22-alpine AS runtime
WORKDIR /repo
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json tsconfig.base.json eslint.config.js ./
COPY services/platform-api ./services/platform-api
RUN pnpm install --frozen-lockfile=false
RUN pnpm --filter @shasvata/platform-api build
EXPOSE 4000
CMD ["pnpm", "--filter", "@shasvata/platform-api", "start"]

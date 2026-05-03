FROM node:22-alpine AS runtime
WORKDIR /repo
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json tsconfig.base.json eslint.config.js ./
COPY packages ./packages
COPY apps/app ./apps/app
RUN pnpm install --frozen-lockfile=false
RUN pnpm --filter @shasvata/app... build
EXPOSE 3003
CMD ["pnpm", "--filter", "@shasvata/app", "start"]

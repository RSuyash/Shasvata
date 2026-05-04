FROM node:22-alpine AS runtime
WORKDIR /repo
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json tsconfig.base.json eslint.config.js ./
COPY packages ./packages
COPY apps/www ./apps/www
RUN pnpm install --frozen-lockfile=false
RUN pnpm --filter @shasvata/www... build
EXPOSE 3000
CMD ["pnpm", "--filter", "@shasvata/www", "start"]

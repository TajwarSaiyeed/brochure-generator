# syntax=docker/dockerfile:1.7

FROM mcr.microsoft.com/playwright:v1.58.2-jammy AS base

ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1

RUN apt-get update \
	&& apt-get install -y --no-install-recommends ca-certificates \
	&& rm -rf /var/lib/apt/lists/* \
	&& corepack enable

FROM base AS deps
WORKDIR /app

ARG DATABASE_URL=postgresql://brochure:brochure@db:5432/brochure_generator
ENV DATABASE_URL=$DATABASE_URL
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
	pnpm install --frozen-lockfile --ignore-scripts --store-dir /pnpm/store

COPY prisma.config.ts ./
COPY prisma ./prisma
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
	pnpm prisma generate

FROM deps AS builder
WORKDIR /app

ARG BETTER_AUTH_URL
ARG BETTER_AUTH_SECRET
ARG NEXT_PUBLIC_APP_URL

ENV BETTER_AUTH_URL=$BETTER_AUTH_URL
ENV BETTER_AUTH_SECRET=$BETTER_AUTH_SECRET
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV NEXT_TELEMETRY_DISABLED=1

COPY . .
RUN --mount=type=cache,id=next-cache,target=/app/.next/cache \
	pnpm build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

RUN groupadd --system nodejs \
	&& useradd --system --gid nodejs --create-home --home-dir /home/nextjs nextjs

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
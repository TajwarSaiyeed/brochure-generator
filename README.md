# Brochure Generator

Docker-first brochure generator built with Next.js, Prisma, Better Auth, MinIO, and OpenRouter.

## Required Environment

Create a `.env` file with at least these values:

```bash
DATABASE_URL=postgresql://brochure:brochure@db:5432/brochure_generator
BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_SECRET=replace-with-your-secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
OPENROUTER_API_KEY=replace-with-your-openrouter-key
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_MODEL=openrouter/elephant-alpha
MINIO_ENDPOINT=http://minio:9000
MINIO_BUCKET=brochure-artifacts
MINIO_REGION=us-east-1
MINIO_ACCESS_KEY=brochure
MINIO_SECRET_KEY=brochure-secret
```

## Run With Docker

Start Postgres, MinIO, and the app together:

```bash
docker compose up --build
```

The app runs at [http://localhost:3000](http://localhost:3000).

## Local Development

Install dependencies and run the dev server with your `.env` file in place:

```bash
pnpm install
pnpm dev
```

## Database

Prisma is configured through [prisma/schema.prisma](prisma/schema.prisma) and [prisma.config.ts](prisma.config.ts). Generate the client and apply migrations with:

```bash
pnpm prisma:generate
pnpm db:migrate
```

If you are starting from a fresh Postgres volume, sync the schema once with:

```bash
pnpm db:push
```

## Auth

Better Auth is wired through [lib/auth.ts](lib/auth.ts) and the route handler at [app/api/auth/[...all]/route.ts](app/api/auth/[...all]/route.ts).

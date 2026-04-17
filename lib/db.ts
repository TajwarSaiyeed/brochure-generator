import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@/generated/prisma/client'
import { Pool } from 'pg'

type PrismaGlobals = typeof globalThis & {
  prisma?: PrismaClient
}

const databaseUrl =
  process.env.DATABASE_URL?.trim() ??
  'postgresql://brochure:brochure@db:5432/brochure_generator'

const pool = new Pool({
  connectionString: databaseUrl,
})

const adapter = new PrismaPg(pool)

const globalForPrisma = globalThis as PrismaGlobals

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export default prisma

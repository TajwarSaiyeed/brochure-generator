import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { prisma } from '@/lib/db'

function readRequiredEnv(name: string) {
  const value = process.env[name]?.trim()

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }

  return value
}

const baseUrl = readRequiredEnv('BETTER_AUTH_URL')
const authSecret = readRequiredEnv('BETTER_AUTH_SECRET')

export const auth = betterAuth({
  baseURL: baseUrl,
  secret: authSecret,
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  emailAndPassword: {
    enabled: true,
  },
  experimental: {
    joins: true,
  },
})

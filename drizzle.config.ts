import type { Config } from 'drizzle-kit'

export default {
  schema: './db/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  dbCredentials: {
    url: process.env.TURSO_DATABASE_URL!,
    token: process.env.TURSO_AUTH_TOKEN!,
  },
} satisfies Config 
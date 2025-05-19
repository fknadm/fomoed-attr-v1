import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'
import * as schema from './schema'

// Create Turso client with provided credentials
const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
})

// Add query logging in development
const logQuery = (query: string, params: any[]) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 Query:', query)
    if (params.length) {
      console.log('📝 Params:', params)
    }
  }
}

// Create and export database instance with schema
export const db = drizzle(client, { 
  schema,
  logger: true,
})

// Export types
export type Database = typeof db
export type Schema = typeof schema 
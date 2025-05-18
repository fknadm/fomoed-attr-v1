import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'
import * as schema from './schema'

// Create Turso client with provided credentials
const client = createClient({
  url: 'libsql://fomoed-attr-fknadm.aws-ap-northeast-1.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NDc1OTE2MDcsImlkIjoiYmMyMDFlYzYtNWI5OS00YmQyLWI4ZTktOTlhYjc4OTVhNTY5IiwicmlkIjoiOTczZTBjNWQtYTVkZS00ZGVhLTliNDktMzU4NDYwYjY3ZmM3In0.wRjd2J76CTdfgvlDkOMr1wwuXX4RrQq7cbU7-g1-OEQo4m67Qraauus3Zc8PRuAkBxSdoiCJx8WF2d4vqnG_AA',
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
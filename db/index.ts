import { getDb } from '@/lib/db'
import * as schema from './schema'

// Export the database instance
export const db = getDb()

// Export types
export type Database = typeof db
export type Schema = typeof schema 
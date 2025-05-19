import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { sql } from 'drizzle-orm'

export async function GET() {
  try {
    const db = getDb()
    
    // Test database connection by running a simple query
    const result = await db.select({ now: sql`datetime('now')` }).from(sql`(SELECT datetime('now') as now)`)
    
    console.log('✅ Database connection test:', result[0])
    
    return NextResponse.json({
      status: 'healthy',
      database: 'connected',
      timestamp: result[0].now
    })
  } catch (error) {
    console.error('❌ Database connection error:', error)
    
    return NextResponse.json({
      status: 'unhealthy',
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 
import { NextResponse } from 'next/server'
import { createClient } from '@libsql/client'

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
})

export async function GET() {
  try {
    // Test database connection by running a simple query
    const result = await client.execute('SELECT datetime("now") as now')
    
    console.log('✅ Database connection test:', result.rows[0])
    
    return NextResponse.json({
      status: 'healthy',
      database: 'connected',
      timestamp: result.rows[0].now
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
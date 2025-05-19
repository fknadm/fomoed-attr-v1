import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { campaigns } from '@/db/schema'
import { nanoid } from 'nanoid'
import { eq } from 'drizzle-orm'
import { sql } from 'drizzle-orm'

// Logger middleware
const logRequest = (method: string, path: string, body?: any) => {
  console.log(`📡 ${method} ${path}`)
  if (body) {
    console.log('📦 Request Body:', body)
  }
}

// Response logger
const logResponse = (status: number, data: any) => {
  console.log(`📬 Response [${status}]:`, data)
}

// Enhanced error logger
const logError = (stage: string, error: any, context?: any) => {
  console.error(`❌ Error during ${stage}:`, {
    message: error?.message,
    name: error?.name,
    stack: error?.stack,
    context,
  })
}

export async function GET(request: Request) {
  try {
    // Log request details
    const url = new URL(request.url)
    console.log('📥 Incoming request:', {
      url: url.toString(),
      method: request.method,
      headers: Object.fromEntries(request.headers.entries())
    })

    // Log environment check
    const envCheck = {
      hasDbUrl: !!process.env.TURSO_DATABASE_URL,
      hasAuthToken: !!process.env.TURSO_AUTH_TOKEN,
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV,
      baseUrl: process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL
    }
    console.log('🔑 Environment check:', envCheck)

    // If missing required env vars, return error immediately
    if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
      logError('environment check', new Error('Missing environment variables'), envCheck)
      return NextResponse.json(
        { 
          error: 'Database configuration error',
          details: 'Missing required environment variables',
          env: envCheck 
        },
        { status: 500 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') as 'draft' | 'active' | 'completed' | 'cancelled' | null
    const projectId = searchParams.get('projectId')
    
    console.log('🔍 Fetching campaigns with filters:', { status, projectId })
    
    let db
    try {
      db = getDb()
      
      // Test database connection with a simple query first
      const testResult = await db.select({ count: sql`count(*)` }).from(campaigns)
      console.log('✅ Database connection test successful:', testResult)
      
      // Now execute the main query
      const allCampaigns = await db.query.campaigns.findMany({
        with: {
          project: true,
          requirements: true,
          applications: {
            with: {
              creator: {
                with: {
                  user: true,
                },
              },
              metrics: true,
            },
          },
        },
        where: status ? eq(campaigns.status, status) : undefined
      })
      
      console.log('✅ Query executed successfully, found campaigns:', {
        count: allCampaigns.length,
        campaignIds: allCampaigns.map(c => c.id)
      })

      return NextResponse.json(allCampaigns)
    } catch (error) {
      logError('database operation', error, { status, projectId })
      return NextResponse.json(
        { 
          error: 'Database operation failed',
          details: error instanceof Error ? error.message : 'Unknown error',
          env: envCheck
        },
        { status: 500 }
      )
    }
  } catch (error) {
    logError('unexpected error', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const db = getDb()
    
    const newCampaign = await db.insert(campaigns).values({
      id: nanoid(),
      projectId: body.projectId,
      name: body.name,
      description: body.description,
      budget: body.budget,
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning()

    const campaign = await db.query.campaigns.findFirst({
      where: (campaigns, { eq }) => eq(campaigns.id, newCampaign[0].id),
      with: {
        project: true,
        requirements: true,
      },
    })
    
    return NextResponse.json(campaign, { status: 201 })
  } catch (error) {
    logError('campaign creation', error)
    return NextResponse.json(
      { error: 'Failed to create campaign' },
      { status: 500 }
    )
  }
} 
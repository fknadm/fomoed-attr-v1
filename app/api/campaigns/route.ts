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

export async function GET(request: Request) {
  try {
    // Log environment variables (without sensitive data)
    console.log('🔑 Environment check:', {
      hasDbUrl: !!process.env.TURSO_DATABASE_URL,
      hasAuthToken: !!process.env.TURSO_AUTH_TOKEN,
      dbUrlPrefix: process.env.TURSO_DATABASE_URL?.substring(0, 20) + '...',
      dbName: process.env.TURSO_DATABASE_URL?.split('/').pop(),
      authTokenLength: process.env.TURSO_AUTH_TOKEN?.length
    })

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') as 'draft' | 'active' | 'completed' | 'cancelled' | null
    const projectId = searchParams.get('projectId')
    
    console.log('🔍 Fetching campaigns with filters:', { status, projectId })
    
    let db
    try {
      db = getDb()
      console.log('✅ Database client created successfully')
      
      // Test the connection
      const client = (db as any).$client
      const testResult = await client.execute('SELECT 1')
      console.log('✅ Database connection test:', testResult)
      
    } catch (dbError) {
      console.error('❌ Failed to create database client:', dbError)
      throw dbError
    }
    
    // First try a simple query to test connection
    try {
      const campaignCount = await db.select({ count: sql`count(*)` }).from(campaigns)
      console.log('📊 Total campaigns in database:', campaignCount)
      
      // Add direct SQL query
      const rawCampaigns = await (db as any).$client.execute('SELECT * FROM campaigns')
      console.log('📝 Raw campaigns data:', rawCampaigns)
    } catch (countError) {
      console.error('❌ Failed to count campaigns:', countError)
      throw countError
    }
    
    let allCampaigns
    try {
      allCampaigns = await db.query.campaigns.findMany({
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
      })
      
      console.log('🔎 Raw query results:', JSON.stringify(allCampaigns, null, 2))
    } catch (queryError) {
      console.error('❌ Failed to fetch campaigns:', queryError)
      throw queryError
    }
    
    console.log('✅ Query executed successfully, found campaigns:', allCampaigns.length)
    console.log('📝 Campaign details:', allCampaigns)
    
    logResponse(200, { count: allCampaigns.length })
    return NextResponse.json(allCampaigns)
  } catch (error) {
    console.error('❌ Error fetching campaigns:', error)
    const errorMessage = error instanceof Error 
      ? error.message
      : 'An unexpected error occurred while fetching campaigns'
    
    // Log the full error stack trace in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Full error details:', error)
    }
    
    logResponse(500, { error: errorMessage })
    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
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
    console.error('Error creating campaign:', error)
    return NextResponse.json(
      { error: 'Failed to create campaign' },
      { status: 500 }
    )
  }
} 
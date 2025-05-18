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
    // Log environment check
    const envCheck = {
      hasDbUrl: !!process.env.TURSO_DATABASE_URL,
      hasAuthToken: !!process.env.TURSO_AUTH_TOKEN,
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV
    }
    console.log('🔑 Environment check:', envCheck)

    // If missing required env vars, return error immediately
    if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
      console.error('❌ Missing required environment variables')
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
      console.log('✅ Database client created successfully')
    } catch (dbError) {
      console.error('❌ Failed to create database client:', dbError)
      return NextResponse.json(
        { 
          error: 'Database connection error',
          details: dbError instanceof Error ? dbError.message : 'Unknown error',
          env: envCheck
        },
        { status: 500 }
      )
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
        where: status ? eq(campaigns.status, status) : undefined
      })
      
      console.log('✅ Query executed successfully, found campaigns:', allCampaigns.length)
    } catch (queryError) {
      console.error('❌ Failed to fetch campaigns:', queryError)
      return NextResponse.json(
        { 
          error: 'Database query error',
          details: queryError instanceof Error ? queryError.message : 'Unknown error',
          env: envCheck
        },
        { status: 500 }
      )
    }
    
    return NextResponse.json(allCampaigns)
  } catch (error) {
    console.error('❌ Unexpected error:', error)
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
    console.error('Error creating campaign:', error)
    return NextResponse.json(
      { error: 'Failed to create campaign' },
      { status: 500 }
    )
  }
} 
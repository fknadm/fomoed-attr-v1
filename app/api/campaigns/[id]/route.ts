import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { campaigns } from '@/db/schema'
import { eq } from 'drizzle-orm'

// Logger middleware
const logRequest = async (req: NextRequest) => {
  console.log(`📡 [${req.method}] ${req.url}`)
}

// Response logger
const logResponse = (status: number, data: any) => {
  console.log(`📬 Response [${status}]:`, data)
}

// Validate campaign ID
const validateCampaignId = (id: string): boolean => {
  return Boolean(id) && typeof id === 'string' && id.length > 0
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = getDb()
    const { id } = params
    
    const campaign = await db.query.campaigns.findFirst({
      where: (campaigns, { eq }) => eq(campaigns.id, id),
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
    
    if (!campaign) {
      logResponse(404, { error: 'Campaign not found' })
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }
    
    logResponse(200, campaign)
    return NextResponse.json(campaign)
  } catch (error) {
    console.error('Error fetching campaign:', error)
    return NextResponse.json(
      { error: 'Failed to fetch campaign' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const params = await context.params
    const { id } = params
    const body = await request.json()
    const db = getDb()
    
    await db.update(campaigns)
      .set({
        name: body.name,
        description: body.description,
        budget: body.budget,
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
        status: body.status,
        updatedAt: new Date(),
      })
      .where(eq(campaigns.id, id))

    const campaign = await db.query.campaigns.findFirst({
      where: (campaigns, { eq }) => eq(campaigns.id, id),
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
    
    logResponse(200, campaign)
    return NextResponse.json(campaign)
  } catch (error) {
    console.error('Error updating campaign:', error)
    return NextResponse.json(
      { error: 'Failed to update campaign' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const params = await context.params
    const { id } = params
    const db = getDb()
    
    await db.delete(campaigns)
      .where(eq(campaigns.id, id))
    
    logResponse(200, { message: 'Campaign deleted successfully' })
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Error deleting campaign:', error)
    return NextResponse.json(
      { error: 'Failed to delete campaign' },
      { status: 500 }
    )
  }
} 
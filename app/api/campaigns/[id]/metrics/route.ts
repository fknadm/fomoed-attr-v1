import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { campaignMetrics } from '@/db/schema'
import { nanoid } from 'nanoid'
import { eq } from 'drizzle-orm'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const db = getDb()
    const metrics = await db.query.campaignMetrics.findMany({
      where: (metrics, { eq }) => eq(metrics.campaignId, params.id),
      with: {
        application: {
          with: {
            creator: {
              with: {
                user: true,
              },
            },
          },
        },
      },
    })
    
    return NextResponse.json(metrics)
  } catch (error) {
    console.error('Error fetching campaign metrics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch campaign metrics' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const db = getDb()
    
    const newMetrics = await db.insert(campaignMetrics).values({
      id: nanoid(),
      campaignId: params.id,
      applicationId: body.applicationId,
      impressions: body.impressions,
      clicks: body.clicks,
      conversions: body.conversions,
      engagement: body.engagement,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning()

    const metrics = await db.query.campaignMetrics.findFirst({
      where: (metrics, { eq }) => eq(metrics.id, newMetrics[0].id),
      with: {
        application: {
          with: {
            creator: {
              with: {
                user: true,
              },
            },
          },
        },
      },
    })
    
    return NextResponse.json(metrics, { status: 201 })
  } catch (error) {
    console.error('Error creating campaign metrics:', error)
    return NextResponse.json(
      { error: 'Failed to create campaign metrics' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const db = getDb()
    
    await db.update(campaignMetrics)
      .set({
        impressions: body.impressions,
        clicks: body.clicks,
        conversions: body.conversions,
        engagement: body.engagement,
        updatedAt: new Date(),
      })
      .where(eq(campaignMetrics.id, body.id))

    const metrics = await db.query.campaignMetrics.findFirst({
      where: (metrics, { eq }) => eq(metrics.id, body.id),
      with: {
        application: {
          with: {
            creator: {
              with: {
                user: true,
              },
            },
          },
        },
      },
    })
    
    return NextResponse.json(metrics)
  } catch (error) {
    console.error('Error updating campaign metrics:', error)
    return NextResponse.json(
      { error: 'Failed to update campaign metrics' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const metricId = searchParams.get('metricId')
    
    if (!metricId) {
      return NextResponse.json(
        { error: 'Metric ID is required' },
        { status: 400 }
      )
    }

    const db = getDb()
    
    await db.delete(campaignMetrics)
      .where(eq(campaignMetrics.id, metricId))
    
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Error deleting campaign metrics:', error)
    return NextResponse.json(
      { error: 'Failed to delete campaign metrics' },
      { status: 500 }
    )
  }
} 
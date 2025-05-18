import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { campaignApplications } from '@/db/schema'
import { nanoid } from 'nanoid'
import { and, eq } from 'drizzle-orm'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const db = getDb()
    
    // TODO: Get the creator's ID from the session
    const creatorId = 'creator_1' // Temporary for testing

    // Check if creator has already applied
    const existingApplication = await db.query.campaignApplications.findFirst({
      where: (apps, { and, eq }) => and(
        eq(apps.campaignId, params.id),
        eq(apps.creatorId, creatorId)
      ),
    })

    if (existingApplication) {
      return NextResponse.json(
        { error: 'You have already applied to this campaign' },
        { status: 400 }
      )
    }

    // Create application
    await db.insert(campaignApplications).values({
      id: nanoid(),
      campaignId: params.id,
      creatorId: creatorId,
      status: 'pending',
      proposal: body.message,
      proposedAmount: body.proposedAmount,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const newApplication = await db.query.campaignApplications.findFirst({
      where: (apps, { and, eq }) => and(
        eq(apps.campaignId, params.id),
        eq(apps.creatorId, creatorId)
      ),
      with: {
        campaign: {
          with: {
            project: true,
          },
        },
        creator: true,
      },
    })
    
    return NextResponse.json(newApplication, { status: 201 })
  } catch (error) {
    console.error('Error creating application:', error)
    return NextResponse.json(
      { error: 'Failed to create application' },
      { status: 500 }
    )
  }
} 
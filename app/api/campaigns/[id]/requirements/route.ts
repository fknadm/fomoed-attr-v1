import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { campaignRequirements } from '@/db/schema'
import { nanoid } from 'nanoid'
import { eq } from 'drizzle-orm'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const db = getDb()
    const requirements = await db.query.campaignRequirements.findFirst({
      where: (reqs, { eq }) => eq(reqs.campaignId, params.id),
    })
    
    if (!requirements) {
      return NextResponse.json(
        { error: 'Campaign requirements not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(requirements)
  } catch (error) {
    console.error('Error fetching campaign requirements:', error)
    return NextResponse.json(
      { error: 'Failed to fetch campaign requirements' },
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
    
    const newRequirements = await db.insert(campaignRequirements).values({
      id: nanoid(),
      campaignId: params.id,
      minFollowers: body.minFollowers,
      requiredPlatforms: JSON.stringify(body.requiredPlatforms),
      contentType: body.contentType,
      deliverables: JSON.stringify(body.deliverables),
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning()

    const requirements = await db.query.campaignRequirements.findFirst({
      where: (reqs, { eq }) => eq(reqs.id, newRequirements[0].id),
    })
    
    return NextResponse.json(requirements, { status: 201 })
  } catch (error) {
    console.error('Error creating campaign requirements:', error)
    return NextResponse.json(
      { error: 'Failed to create campaign requirements' },
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
    
    await db.update(campaignRequirements)
      .set({
        minFollowers: body.minFollowers,
        requiredPlatforms: JSON.stringify(body.requiredPlatforms),
        contentType: body.contentType,
        deliverables: JSON.stringify(body.deliverables),
        updatedAt: new Date(),
      })
      .where(eq(campaignRequirements.campaignId, params.id))

    const requirements = await db.query.campaignRequirements.findFirst({
      where: (reqs, { eq }) => eq(reqs.campaignId, params.id),
    })
    
    return NextResponse.json(requirements)
  } catch (error) {
    console.error('Error updating campaign requirements:', error)
    return NextResponse.json(
      { error: 'Failed to update campaign requirements' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const db = getDb()
    
    await db.delete(campaignRequirements)
      .where(eq(campaignRequirements.campaignId, params.id))
    
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Error deleting campaign requirements:', error)
    return NextResponse.json(
      { error: 'Failed to delete campaign requirements' },
      { status: 500 }
    )
  }
} 
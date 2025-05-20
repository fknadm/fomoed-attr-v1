import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { campaigns, campaignMetrics, campaignApplications, campaignRequirements, campaignMonetizationPolicies } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { logError } from '@/lib/logger'

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
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const db = getDb()
    const campaign = await db.query.campaigns.findFirst({
      where: (campaigns, { eq }) => eq(campaigns.id, params.id),
      with: {
        project: true,
        requirements: true,
        monetizationPolicies: {
          with: {
            policy: {
              with: {
                milestoneBonus: true,
                kolTierBonus: true,
              },
            },
          },
        },
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
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(campaign)
  } catch (error) {
    logError('campaign fetch', error)
    return NextResponse.json(
      { error: 'Failed to fetch campaign' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json()
    const db = getDb()

    // Update campaign
    const [updatedCampaign] = await db
      .update(campaigns)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(campaigns.id, params.id))
      .returning()

    if (!updatedCampaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    // Fetch the complete campaign with all relations
    const campaign = await db.query.campaigns.findFirst({
      where: (campaigns, { eq }) => eq(campaigns.id, params.id),
      with: {
        project: true,
        requirements: true,
        monetizationPolicies: {
          with: {
            policy: {
              with: {
                milestoneBonus: true,
                kolTierBonus: true,
              },
            },
          },
        },
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

    return NextResponse.json(campaign)
  } catch (error) {
    logError('campaign update', error)
    return NextResponse.json(
      { error: 'Failed to update campaign' },
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
    const [deletedCampaign] = await db
      .delete(campaigns)
      .where(eq(campaigns.id, params.id))
      .returning()

    if (!deletedCampaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    logError('campaign deletion', error)
    return NextResponse.json(
      { error: 'Failed to delete campaign' },
      { status: 500 }
    )
  }
} 
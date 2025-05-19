import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { monetizationPolicies, milestoneBonus, kolTierBonus } from '@/db/schema'
import { logError } from '@/lib/logger'

export async function GET() {
  try {
    const db = getDb()
    
    const policies = await db.query.monetizationPolicies.findMany({
      with: {
        campaigns: true,
        milestoneBonus: true,
        kolTierBonus: true,
      },
    })
    
    return NextResponse.json(policies)
  } catch (error) {
    logError('fetching monetization policies', error)
    return NextResponse.json(
      { error: 'Failed to fetch monetization policies' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const db = getDb()
    
    // Create the policy
    const [policy] = await db.insert(monetizationPolicies).values({
      id: body.id,
      name: body.name,
      description: body.description,
      baseRateMultiplier: body.baseRateMultiplier,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning()

    // Create milestone bonuses
    if (body.milestoneBonus?.length) {
      await db.insert(milestoneBonus).values(
        body.milestoneBonus.map((milestone: any) => ({
          id: milestone.id,
          policyId: policy.id,
          impressionGoal: milestone.impressionGoal,
          bonusAmount: milestone.bonusAmount,
          createdAt: new Date(),
          updatedAt: new Date(),
        }))
      )
    }

    // Create KOL tier bonuses
    if (body.kolTierBonus?.length) {
      await db.insert(kolTierBonus).values(
        body.kolTierBonus.map((bonus: any) => ({
          id: bonus.id,
          policyId: policy.id,
          tier: bonus.tier,
          bonusPercentage: bonus.bonusPercentage,
          createdAt: new Date(),
          updatedAt: new Date(),
        }))
      )
    }

    // Fetch the complete policy with relations
    const completePolicy = await db.query.monetizationPolicies.findFirst({
      where: (monetizationPolicies, { eq }) => eq(monetizationPolicies.id, policy.id),
      with: {
        milestoneBonus: true,
        kolTierBonus: true,
      },
    })
    
    return NextResponse.json(completePolicy, { status: 201 })
  } catch (error) {
    logError('creating monetization policy', error)
    return NextResponse.json(
      { error: 'Failed to create monetization policy' },
      { status: 500 }
    )
  }
} 
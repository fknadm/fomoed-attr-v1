import { getDb } from '@/lib/db'
import { campaigns } from '@/db/schema'
import { eq } from 'drizzle-orm'

export interface Campaign {
  id: string
  name: string
  description: string
  status: 'draft' | 'active' | 'completed' | 'cancelled'
  budget: string
  cpmValue: string
  startDate: Date
  endDate: Date
  projectId: string
  createdAt: Date
  updatedAt: Date
  project: {
    id: string
    name: string
  }
  requirements: {
    minFollowers: number
    requiredPlatforms: string
    contentType: string
    deliverables: string
  } | null
  monetizationPolicies: Array<{
    policy: {
      id: string
      name: string
      description: string | null
      baseRateMultiplier: string
      createdAt: Date
      updatedAt: Date
      milestoneBonus: Array<{
        id: string
        policyId: string
        impressionGoal: number
        bonusAmount: string
        createdAt: Date
        updatedAt: Date
      }>
      kolTierBonus: Array<{
        id: string
        policyId: string
        tier: 'BRONZE' | 'SILVER' | 'GOLD'
        bonusPercentage: string
        createdAt: Date
        updatedAt: Date
      }>
    }
  }>
  applications: Array<{
    id: string
    status: string
    proposal: string | null
    proposedAmount: string | null
    creator: {
      user: {
        username: string
        avatar: string
      }
      bio: string
      twitterHandle: string
      twitterFollowers: number
      tier: 'BRONZE' | 'SILVER' | 'GOLD'
    }
    metrics: Array<{
      id: string
      impressions: number
      clicks: number
      conversions: number
      engagement: string
      postUrl: string
      platform: string
    }>
  }>
  heroImage?: string
  socialLinks?: Record<string, string>
}

export async function getCampaign(id: string): Promise<Campaign | null> {
  try {
    const db = getDb()
    
    console.log('🔍 Fetching campaign from database:', id)
    
    const campaign = await db.query.campaigns.findFirst({
      where: (campaigns, { eq }) => eq(campaigns.id, id),
      with: {
        project: true,
        requirements: true,
        monetizationPolicies: {
          with: {
            policy: {
              with: {
                milestoneBonus: true,
                kolTierBonus: true,
              }
            }
          }
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
      console.log('❌ Campaign not found:', id)
      return null
    }
    
    console.log('✅ Campaign fetched successfully:', campaign.id)
    return campaign as Campaign
  } catch (error) {
    console.error('Error fetching campaign:', error)
    throw error
  }
} 
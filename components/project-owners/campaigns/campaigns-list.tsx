import * as React from "react"
import Link from "next/link"
import { getBaseUrl } from "@/lib/utils"
import { CampaignCard } from "./campaign-card"
import { getDb } from "@/lib/db"
import { campaigns } from "@/db/schema"

interface Campaign {
  id: string
  name: string
  description: string
  status: string
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
  monetizationPolicy: {
    id: string
    name: string
    baseRateMultiplier: string
  } | null
  requirements: {
    minFollowers: number
    requiredPlatforms: string
    contentType: string
    deliverables: string
  } | null
  applications: {
    id: string
    status: string
    creator: {
      user: {
        username: string
      }
    }
    metrics: {
      impressions: number | null
      clicks: number | null
      conversions: number | null
      engagement: string | null
    }[]
  }[]
}

async function getCampaigns() {
  const db = getDb()
  
  console.log('🔍 Fetching campaigns from database')
  
  const campaigns = await db.query.campaigns.findMany({
    with: {
      project: true,
      requirements: true,
      monetizationPolicy: true,
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

  console.log('✅ Fetched campaigns:', campaigns.length)
  return campaigns
}

export async function CampaignsList() {
  try {
    const campaigns = await getCampaigns()

    if (!campaigns?.length) {
      return (
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-md border border-dashed p-8 text-center animate-in fade-in-50">
          <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
            <h3 className="mb-2 text-lg font-semibold">No campaigns</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              You haven&apos;t created any campaigns yet. Start creating your first campaign.
            </p>
            <Link
              href="/project-owners/campaigns/new"
              className="text-sm font-medium text-primary hover:underline"
            >
              Create a campaign
            </Link>
          </div>
        </div>
      )
    }

    return (
      <div className="grid gap-6">
        {campaigns.map((campaign) => {
          // Calculate total metrics from all applications
          const metrics = {
            impressions: campaign.applications?.reduce((sum, app) => 
              sum + (app.metrics?.reduce((s, m) => s + (m.impressions || 0), 0) || 0), 0) || 0,
            clicks: campaign.applications?.reduce((sum, app) => 
              sum + (app.metrics?.reduce((s, m) => s + (m.clicks || 0), 0) || 0), 0) || 0,
            conversions: campaign.applications?.reduce((sum, app) => 
              sum + (app.metrics?.reduce((s, m) => s + (m.conversions || 0), 0) || 0), 0) || 0,
            engagement: campaign.applications?.reduce((sum, app) => 
              sum + (app.metrics?.reduce((s, m) => s + (parseFloat(m.engagement || '0')), 0) || 0), 0) / 
              (campaign.applications?.reduce((sum, app) => sum + (app.metrics?.length || 0), 0) || 1) || 0,
            get ctr() {
              return this.impressions > 0 ? (this.clicks / this.impressions) * 100 : 0
            },
            get conversionRate() {
              return this.clicks > 0 ? (this.conversions / this.clicks) * 100 : 0
            },
            get cpc() {
              return this.clicks > 0 ? parseFloat(campaign.budget) / this.clicks : 0
            },
          }
          
          const platforms = campaign.requirements?.requiredPlatforms 
            ? JSON.parse(campaign.requirements.requiredPlatforms) as string[]
            : []
          
          return (
            <CampaignCard
              key={campaign.id}
              id={campaign.id}
              name={campaign.name}
              status={campaign.status}
              budget={campaign.budget}
              cpmValue={campaign.cpmValue}
              startDate={campaign.startDate.toISOString()}
              endDate={campaign.endDate.toISOString()}
              projectName={campaign.project.name}
              metrics={metrics}
              platforms={platforms}
              applicationsCount={campaign.applications.length}
              monetizationPolicy={campaign.monetizationPolicy}
            />
          )
        })}
      </div>
    )
  } catch (error) {
    console.error('Error in CampaignsList:', error)
    
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-md border border-dashed border-destructive p-8 text-center animate-in fade-in-50">
        <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
          <h3 className="mb-2 text-lg font-semibold text-destructive">Error Loading Campaigns</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            {error instanceof Error ? error.message : 'An unexpected error occurred while loading campaigns.'}
          </p>
          <Link
            href="/project-owners"
            className="text-sm font-medium text-primary hover:underline"
          >
            Try again
          </Link>
        </div>
      </div>
    )
  }
} 
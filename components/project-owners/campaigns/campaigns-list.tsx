import * as React from "react"
import Link from "next/link"
import { getBaseUrl } from "@/lib/utils"
import { CampaignCard } from "./campaign-card"

interface Campaign {
  id: string
  name: string
  description: string
  status: string
  budget: string
  startDate: string
  endDate: string
  project: {
    id: string
    name: string
  }
  metrics: {
    impressions: number
    clicks: number
    conversions: number
    engagement: string
  }[]
  requirements: {
    minFollowers: number
    requiredPlatforms: string[]
    contentType: string
    deliverables: string[]
  }
  applications: {
    id: string
    status: string
    creator: {
      user: {
        username: string
      }
    }
  }[]
}

async function getCampaigns() {
  const baseUrl = getBaseUrl()
  
  console.log('🔍 Fetching campaigns from:', `${baseUrl}/api/campaigns`)
  
  const res = await fetch(`${baseUrl}/api/campaigns`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  })

  // Read the response body text once
  const responseText = await res.text()
  
  if (!res.ok) {
    // Try to parse as JSON first
    try {
      const errorData = JSON.parse(responseText)
      console.error('❌ Failed to fetch campaigns:', errorData)
      throw new Error(errorData.error || errorData.message || 'Failed to fetch campaigns')
    } catch (e) {
      // If JSON parsing fails, it might be HTML
      console.error('❌ Received non-JSON response:', responseText.substring(0, 200))
      throw new Error('Received invalid response format from server')
    }
  }

  // Try to parse the successful response as JSON
  try {
    const data = JSON.parse(responseText)
    console.log('✅ Fetched campaigns:', data)
    return data
  } catch (e) {
    console.error('❌ Failed to parse response as JSON:', e)
    throw new Error('Invalid JSON response from server')
  }
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
        {campaigns.map((campaign: Campaign) => {
          const metrics = {
            impressions: campaign.metrics?.reduce((sum, m) => sum + m.impressions, 0) || 0,
            clicks: campaign.metrics?.reduce((sum, m) => sum + m.clicks, 0) || 0,
            conversions: campaign.metrics?.reduce((sum, m) => sum + m.conversions, 0) || 0,
            engagement: campaign.metrics?.reduce((sum, m) => sum + parseFloat(m.engagement), 0) / (campaign.metrics?.length || 1) || 0,
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
          
          return (
            <CampaignCard
              key={campaign.id}
              id={campaign.id}
              name={campaign.name}
              status={campaign.status}
              budget={campaign.budget}
              startDate={campaign.startDate}
              endDate={campaign.endDate}
              projectName={campaign.project.name}
              metrics={metrics}
              platforms={campaign.requirements.requiredPlatforms}
              applicationsCount={campaign.applications.length}
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
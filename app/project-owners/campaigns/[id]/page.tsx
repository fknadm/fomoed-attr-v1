import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Users, DollarSign, BarChart2, TrendingUp, MousePointerClick, Share2, Clock, AlertTriangle } from "lucide-react"
import { formatCurrency, formatNumber } from "@/lib/format"
import { calculateCampaignPerformance } from '@/lib/metrics'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getDb } from '@/lib/db'
import { campaigns } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { ErrorBoundary } from '@/components/ui/error-boundary'
import { Suspense } from 'react'
import { CampaignHero } from '@/components/project-owners/campaigns/campaign-hero'
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { CampaignActions } from '@/components/project-owners/campaigns/campaign-actions'

interface MilestoneBonus {
  id: string
  policyId: string
  impressionGoal: number
  bonusAmount: string
  createdAt: Date
  updatedAt: Date
}

interface KolTierBonus {
  id: string
  policyId: string
  tier: 'BRONZE' | 'SILVER' | 'GOLD'
  bonusPercentage: string
  createdAt: Date
  updatedAt: Date
}

interface MonetizationPolicy {
  id: string
  name: string
  description: string | null
  baseRateMultiplier: string
  createdAt: Date
  updatedAt: Date
  milestoneBonus: MilestoneBonus[]
  kolTierBonus: KolTierBonus[]
}

interface CampaignApplication {
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
}

interface CampaignMetrics {
  id: string
  name: string
  description: string
  status: 'draft' | 'active' | 'completed' | 'cancelled'
  budget: string
  startDate: string
  endDate: string
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
  applications: {
    metrics: {
      impressions: number
      clicks: number
      conversions: number
      engagement: string
    }[]
    proposedAmount: string
  }[]
}

interface Campaign {
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
    policy: MonetizationPolicy
  }>
  applications: CampaignApplication[]
  heroImage?: string
  socialLinks?: {
    // Assuming socialLinks is stored in requirements or another field if not directly on the campaign object
  }
}

// Validate campaign ID
const validateCampaignId = (id: string | undefined): string => {
  if (!id || typeof id !== 'string') {
    throw new Error('Invalid campaign ID')
  }
  return id
}

function calculatePayoutValue(
  cpmValue: string,
  impressions: number,
  baseRateMultiplier: string,
  bonusPercentage: string,
  milestoneBonus: { impressionGoal: number; bonusAmount: string }[]
): number {
  // Calculate base payout from CPM
  const basePayout = (parseFloat(cpmValue) * impressions) / 1000

  // Apply base rate multiplier
  const multipliedPayout = basePayout * parseFloat(baseRateMultiplier)

  // Apply KOL tier bonus
  const tierBonus = multipliedPayout * (parseFloat(bonusPercentage) / 100)

  // Apply milestone bonuses
  const milestoneBonuses = milestoneBonus
    .filter(milestone => impressions >= milestone.impressionGoal)
    .reduce((sum, milestone) => sum + parseFloat(milestone.bonusAmount), 0)

  return multipliedPayout + tierBonus + milestoneBonuses
}

async function getCampaign(id: string): Promise<Campaign | null> {
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

interface PageProps {
  params: { id: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

export async function generateMetadata(
  { params }: PageProps
): Promise<Metadata> {
  const resolvedParams = await params
  const campaign = await getCampaign(resolvedParams.id)
  
  if (!campaign) {
    return {
      title: 'Campaign Not Found',
      description: 'The requested campaign could not be found.',
    }
  }
  
  return {
    title: `${campaign.name} - Campaign Details`,
    description: campaign.description,
  }
}

function CampaignLoading() {
  return (
    <div className="grid gap-6">
      {[...Array(4)].map((_, i) => (
        <Card key={i} className="animate-pulse">
          <CardHeader>
            <div className="h-6 w-1/3 bg-muted rounded" />
          </CardHeader>
          <CardContent>
            <div className="h-24 bg-muted rounded" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default async function CampaignDetailsPage({
  params,
}: PageProps) {
  const resolvedParams = await params
  const campaign = await getCampaign(resolvedParams.id)
  
  if (!campaign) {
    notFound()
  }

  // Extract heroImage and socialLinks from requirements.deliverables
  let heroImage = ''
  let socialLinks = {}
  try {
    if (campaign.requirements?.deliverables) {
      const deliverablesObj = JSON.parse(campaign.requirements.deliverables)
      heroImage = deliverablesObj.heroImage || ''
      socialLinks = deliverablesObj.socialLinks || {}
    }
  } catch (e) {
    // fallback to empty values
  }

  // Calculate metrics
  const metrics = {
    impressions: campaign.applications?.reduce((sum: number, app) => 
      sum + (app.metrics?.reduce((s: number, m) => s + m.impressions, 0) || 0), 0) || 0,
    clicks: campaign.applications?.reduce((sum: number, app) => 
      sum + (app.metrics?.reduce((s: number, m) => s + m.clicks, 0) || 0), 0) || 0,
    conversions: campaign.applications?.reduce((sum: number, app) => 
      sum + (app.metrics?.reduce((s: number, m) => s + m.conversions, 0) || 0), 0) || 0,
    engagement: campaign.applications?.reduce((sum: number, app) => 
      sum + (app.metrics?.reduce((s: number, m) => s + parseFloat(m.engagement), 0) || 0), 0) / 
      (campaign.applications?.reduce((sum: number, app) => sum + (app.metrics?.length || 0), 0) || 1) || 0,
    ctr: 0,
    conversionRate: 0,
    cpc: 0
  }

  metrics.ctr = metrics.impressions > 0 ? (metrics.clicks / metrics.impressions) * 100 : 0
  metrics.conversionRate = metrics.clicks > 0 ? (metrics.conversions / metrics.clicks) * 100 : 0
  metrics.cpc = metrics.clicks > 0 ? parseFloat(campaign.budget) / metrics.clicks : 0

  const platforms = campaign.requirements?.requiredPlatforms 
    ? JSON.parse(campaign.requirements.requiredPlatforms) as string[]
    : []
  
  // Calculate performance metrics
  const campaignForMetrics: CampaignMetrics = {
    ...campaign,
    startDate: campaign.startDate.toISOString(),
    endDate: campaign.endDate.toISOString(),
    applications: campaign.applications.map(app => ({
      metrics: app.metrics.map(m => ({
        impressions: m.impressions,
        clicks: m.clicks,
        conversions: m.conversions,
        engagement: m.engagement
      })),
      proposedAmount: app.proposedAmount || '0'
    }))
  }
  
  const performance = calculateCampaignPerformance(campaignForMetrics)

  return (
    <>
      <CampaignHero
        title={campaign.name}
        description={campaign.description}
        heroImage={heroImage || undefined}
        socialLinks={socialLinks}
      />
      <Tabs defaultValue="analytics" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="monetization">Monetization</TabsTrigger>
          <TabsTrigger value="applications">
            Applications ({campaign.applications?.filter(app => app.status === 'approved' || app.status === 'pending').length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-2xl font-bold">{campaign.name}</CardTitle>
                    <Badge 
                      variant={
                        campaign.status === 'active' ? 'default' :
                        campaign.status === 'draft' ? 'secondary' :
                        'destructive'
                      }
                      className={`capitalize ${
                        campaign.status === 'active' ? 'bg-green-500/10 text-green-500' :
                        campaign.status === 'draft' ? 'bg-yellow-500/10 text-yellow-500' :
                        'bg-red-500/10 text-red-500'
                      }`}
                    >
                      {campaign.status}
                    </Badge>
                  </div>
                  <div className="text-lg text-muted-foreground">
                    Project: {campaign.project.name}
                  </div>
                </div>
                <CampaignActions campaign={campaign} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-4 border-b">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{formatCurrency(parseFloat(campaign.budget))}</p>
                    <p className="text-xs text-muted-foreground">Budget</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{formatCurrency(parseFloat(campaign.cpmValue))}</p>
                    <p className="text-xs text-muted-foreground">CPM Value</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{campaign.applications?.length || 0}</p>
                    <p className="text-xs text-muted-foreground">Applications</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">
                      {new Date(campaign.startDate).toLocaleDateString()} - {new Date(campaign.endDate).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-muted-foreground">Timeline</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 md:grid-cols-7 gap-4 pt-4">
                <div className="flex items-center gap-2">
                  <BarChart2 className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{formatNumber(metrics.impressions)}</p>
                    <p className="text-xs text-muted-foreground">Impressions</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <MousePointerClick className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{formatNumber(metrics.clicks)}</p>
                    <p className="text-xs text-muted-foreground">Clicks</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Share2 className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{metrics.ctr.toFixed(2)}%</p>
                    <p className="text-xs text-muted-foreground">CTR</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{metrics.conversionRate.toFixed(2)}%</p>
                    <p className="text-xs text-muted-foreground">Conv. Rate</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{formatCurrency(metrics.cpc)}</p>
                    <p className="text-xs text-muted-foreground">CPC</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <BarChart2 className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{formatNumber(metrics.conversions)}</p>
                    <p className="text-xs text-muted-foreground">Conversions</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{metrics.engagement.toFixed(2)}%</p>
                    <p className="text-xs text-muted-foreground">Engagement</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Budget & Pacing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm font-medium">Ideal Daily Spend</p>
                  <p className="text-2xl font-bold">{formatCurrency(performance.ideal_daily_spend)}</p>
                  <p className="text-xs text-muted-foreground">Target daily budget</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Actual Daily Spend</p>
                  <p className="text-2xl font-bold">{formatCurrency(performance.actual_daily_spend)}</p>
                  <p className="text-xs text-muted-foreground">Current daily spend</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Remaining Daily Spend</p>
                  <p className="text-2xl font-bold">{formatCurrency(performance.remaining_daily_spend)}</p>
                  <p className="text-xs text-muted-foreground">Required daily spend to stay on budget</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Remaining Budget</p>
                  <p className="text-2xl font-bold">{formatCurrency(performance.remaining_budget)}</p>
                  <p className="text-xs text-muted-foreground">Budget left to spend</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Campaign Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm font-medium">Projected Total Spend</p>
                    </div>
                    <p className="text-2xl font-bold">{formatCurrency(performance.projected_total_spend)}</p>
                    <p className="text-xs text-muted-foreground">Based on current daily spend</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm font-medium">Budget Variance</p>
                    </div>
                    <p className={`text-2xl font-bold ${performance.budget_variance > 0 ? 'text-red-500' : 'text-green-500'}`}>
                      {formatCurrency(Math.abs(performance.budget_variance))}
                      {performance.budget_variance > 0 ? ' Over' : ' Under'}
                    </p>
                    <p className="text-xs text-muted-foreground">Projected vs allocated budget</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm font-medium">Pacing Index</p>
                    </div>
                    <p className={`text-2xl font-bold ${
                      performance.pacing_index > 1 ? 'text-red-500' : 
                      performance.pacing_index < 1 ? 'text-yellow-500' : 
                      'text-green-500'
                    }`}>
                      {performance.pacing_index.toFixed(2)}x
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {performance.pacing_index > 1 ? 'Overspending' : 
                       performance.pacing_index < 1 ? 'Underspending' : 
                       'On track'}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <BarChart2 className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm font-medium">Delivered Impressions</p>
                    </div>
                    <p className="text-2xl font-bold">{formatNumber(performance.delivered_impressions)}</p>
                    <p className="text-xs text-muted-foreground">Total impressions delivered</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <Share2 className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm font-medium">Forecasted Impressions</p>
                    </div>
                    <p className="text-2xl font-bold">{formatNumber(performance.forecasted_impressions_remaining)}</p>
                    <p className="text-xs text-muted-foreground">Expected additional impressions</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm font-medium">Cost Per Engagement</p>
                    </div>
                    <p className="text-2xl font-bold">{formatCurrency(performance.cost_per_engagement)}</p>
                    <p className="text-xs text-muted-foreground">Average cost per engagement</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm font-medium">Days Coverable</p>
                    </div>
                    <p className="text-2xl font-bold">{Math.round(performance.days_coverable)} days</p>
                    <p className="text-xs text-muted-foreground">At current spend rate</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm font-medium">Projected Engagement</p>
                    </div>
                    <p className="text-2xl font-bold">{formatNumber(performance.projected_total_engagement)}</p>
                    <p className="text-xs text-muted-foreground">Expected total engagement</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm font-medium">CPM Variance</p>
                    </div>
                    <p className={`text-2xl font-bold ${performance.cpm_variance > 0 ? 'text-red-500' : 'text-green-500'}`}>
                      {Math.abs(performance.cpm_variance).toFixed(1)}%
                      {performance.cpm_variance > 0 ? ' Over' : ' Under'}
                    </p>
                    <p className="text-xs text-muted-foreground">Current vs budgeted CPM</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monetization" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Monetization</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium mb-2">CPM Details</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Base CPM</p>
                      <p className="text-lg font-medium">{formatCurrency(parseFloat(campaign.cpmValue))}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Current CPM</p>
                      <p className="text-lg font-medium">
                        {formatCurrency(
                          metrics.impressions > 0
                            ? (parseFloat(campaign.budget) / metrics.impressions) * 1000
                            : 0
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {campaign.monetizationPolicies && campaign.monetizationPolicies.length > 0 ? (
                  campaign.monetizationPolicies.map(({ policy }) => (
                    <div key={policy.id} className="space-y-6">
                      <div>
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-medium mb-2">Policy: {policy.name}</h4>
                            <p className="text-sm text-muted-foreground">{policy.description}</p>
                          </div>
                          <Link
                            href={`/project-owners/monetization?policy=${policy.id}`}
                            className="text-sm font-medium text-primary hover:underline"
                          >
                            View Policy Details
                          </Link>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium mb-2">Base Rate Multiplier</h4>
                        <p className="text-lg font-medium">{parseFloat(policy.baseRateMultiplier).toFixed(1)}x</p>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium mb-2">Milestone Bonuses</h4>
                        <div className="grid gap-2">
                          {policy.milestoneBonus.map((milestone) => (
                            <div key={milestone.id} className="flex items-center justify-between p-2 rounded-lg border">
                              <span className="text-sm">
                                {formatNumber(milestone.impressionGoal)} Impressions
                              </span>
                              <Badge variant="secondary">
                                +${parseFloat(milestone.bonusAmount).toFixed(2)}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium mb-2">KOL Tier Bonuses</h4>
                        <div className="grid gap-2">
                          {policy.kolTierBonus.map((bonus) => (
                            <div key={bonus.id} className="flex items-center justify-between p-2 rounded-lg border">
                              <Badge
                                variant="outline"
                                className={
                                  bonus.tier === 'GOLD' ? 'bg-yellow-500/10 text-yellow-500' :
                                  bonus.tier === 'SILVER' ? 'bg-slate-500/10 text-slate-500' :
                                  'bg-amber-800/10 text-amber-800'
                                }
                              >
                                {bonus.tier}
                              </Badge>
                              <Badge variant="secondary">
                                +{parseFloat(bonus.bonusPercentage).toFixed(1)}%
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground mb-4">No monetization policy applied to this campaign</p>
                    <Link
                      href={`/project-owners/monetization?campaign=${campaign.id}`}
                      className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                    >
                      Add Monetization Policy
                    </Link>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="applications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Applications ({campaign.applications?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {campaign.applications
                  ?.sort((a: CampaignApplication, b: CampaignApplication) => {
                    const aImpressions = a.metrics?.filter(m => m.postUrl).reduce((sum: number, m) => sum + m.impressions, 0) || 0;
                    const bImpressions = b.metrics?.filter(m => m.postUrl).reduce((sum: number, m) => sum + m.impressions, 0) || 0;
                    return bImpressions - aImpressions;
                  })
                  .map((application, index) => {
                    const totalImpressions = application.metrics?.filter(m => m.postUrl).reduce((sum, m) => sum + m.impressions, 0) || 0;
                    const hasMetrics = application.metrics?.some(m => m.postUrl) || false;
                    return (
                      <Card key={application.id}>
                        <CardContent className="pt-6">
                          <div className="flex items-start gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <div className="relative h-10 w-10 rounded-full overflow-hidden">
                                  <Image
                                    src={application.creator.user.avatar}
                                    alt={application.creator.user.username}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <p className="font-medium">{application.creator.user.username}</p>
                                    <Badge
                                      variant="outline"
                                      className={
                                        application.creator.tier === 'GOLD' ? 'bg-yellow-500/10 text-yellow-500' :
                                        application.creator.tier === 'SILVER' ? 'bg-slate-500/10 text-slate-500' :
                                        'bg-amber-800/10 text-amber-800'
                                      }
                                    >
                                      {application.creator.tier}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground">
                                    {application.creator.twitterHandle} • {formatNumber(application.creator.twitterFollowers)} followers
                                  </p>
                                </div>
                              </div>
                              <div className="mt-4">
                                <p className="text-sm font-medium">Proposal</p>
                                <p className="text-sm text-muted-foreground">{application.proposal || 'No proposal submitted'}</p>
                              </div>
                              <div className="mt-4 grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm font-medium">Status</p>
                                  <Badge 
                                    variant={
                                      application.status === 'approved' ? 'default' :
                                      application.status === 'pending' ? 'secondary' :
                                      'destructive'
                                    }
                                    className={`mt-1 capitalize ${
                                      application.status === 'approved' ? 'bg-green-500/10 text-green-500' :
                                      application.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' :
                                      'bg-red-500/10 text-red-500'
                                    }`}
                                  >
                                    {application.status}
                                  </Badge>
                                </div>
                                <div>
                                  <p className="text-sm font-medium">Payout Value</p>
                                  <p className="text-sm text-muted-foreground">
                                    {(() => {
                                      const totalApplicantImpressions = application.metrics?.filter(m => m.postUrl).reduce((sum, m) => sum + m.impressions, 0) || 0;
                                      let payoutAmount = 0;

                                      if (campaign.monetizationPolicies && campaign.monetizationPolicies.length > 0) {
                                        // Use the first policy for now - in the future we might want to combine or choose between multiple policies
                                        const policy = campaign.monetizationPolicies[0].policy;
                                        payoutAmount = calculatePayoutValue(
                                          campaign.cpmValue,
                                          totalApplicantImpressions,
                                          policy.baseRateMultiplier,
                                          policy.kolTierBonus.find(
                                            bonus => bonus.tier === application.creator.tier
                                          )?.bonusPercentage || '0',
                                          policy.milestoneBonus
                                        );
                                      } else {
                                        // Calculate payout based only on CPM if no policy
                                        const baseCPM = parseFloat(campaign.cpmValue);
                                        if (!isNaN(baseCPM) && totalApplicantImpressions > 0) {
                                          payoutAmount = (baseCPM * totalApplicantImpressions) / 1000;
                                        }
                                      }
                                      
                                      // Ensure payoutAmount is a valid number before formatting
                                      if (isNaN(payoutAmount) || !isFinite(payoutAmount)) {
                                        payoutAmount = 0;
                                      }
                                      return formatCurrency(payoutAmount);
                                    })()}
                                  </p>
                                </div>
                              </div>
                            </div>
                            {hasMetrics && index < 3 && (
                              <div className="relative">
                                <div className="relative w-20 h-20">
                                  {/* Outer glow */}
                                  <div className={`absolute inset-0 rounded-full ${
                                    index === 0 ? 'bg-yellow-500/20 animate-pulse' :
                                    index === 1 ? 'bg-gray-400/20 animate-pulse' :
                                    'bg-amber-600/20 animate-pulse'
                                  }`} />
                                  
                                  {/* Star background */}
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                                      index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' :
                                      index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500' :
                                      'bg-gradient-to-br from-amber-500 to-amber-700'
                                    }`}>
                                      {/* Inner star */}
                                      <div className="absolute inset-0 flex items-center justify-center">
                                        <div className={`w-12 h-12 rounded-full ${
                                          index === 0 ? 'bg-yellow-500/30' :
                                          index === 1 ? 'bg-gray-400/30' :
                                          'bg-amber-600/30'
                                        }`} />
                                      </div>
                                      
                                      {/* Medal number */}
                                      <div className={`relative text-3xl font-bold ${
                                        index === 0 ? 'text-yellow-100' :
                                        index === 1 ? 'text-gray-100' :
                                        'text-amber-100'
                                      }`}>
                                        {index + 1}
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {/* Shine effect */}
                                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent opacity-50" />
                                </div>
                              </div>
                            )}
                          </div>
                          {hasMetrics && (
                            <div className="mt-4 space-y-4">
                              <div className="grid grid-cols-4 gap-4">
                                <div>
                                  <p className="text-sm font-medium">Total Impressions</p>
                                  <p className="text-sm text-muted-foreground">
                                    {formatNumber(application.metrics.filter(m => m.postUrl).reduce((sum, m) => sum + m.impressions, 0))}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium">Total Clicks</p>
                                  <p className="text-sm text-muted-foreground">
                                    {formatNumber(application.metrics.filter(m => m.postUrl).reduce((sum, m) => sum + m.clicks, 0))}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium">Total Conversions</p>
                                  <p className="text-sm text-muted-foreground">
                                    {formatNumber(application.metrics.filter(m => m.postUrl).reduce((sum, m) => sum + m.conversions, 0))}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium">Avg. Engagement</p>
                                  <p className="text-sm text-muted-foreground">
                                    {(application.metrics.filter(m => m.postUrl).reduce((sum, m) => sum + parseFloat(m.engagement), 0) / application.metrics.filter(m => m.postUrl).length).toFixed(2)}%
                                  </p>
                                </div>
                              </div>
                              <div className="space-y-4">
                                {application.metrics.filter(m => m.postUrl).map((metric) => (
                                  <div key={metric.id} className="rounded-lg border p-4">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="capitalize">
                                          {metric.platform}
                                        </Badge>
                                        <a
                                          href={metric.postUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-sm font-medium text-primary hover:underline"
                                        >
                                          View Post
                                        </a>
                                      </div>
                                    </div>
                                    <div className="grid grid-cols-4 gap-2 mt-2">
                                      <div>
                                        <p className="text-xs font-medium">Impressions</p>
                                        <p className="text-xs text-muted-foreground">{formatNumber(metric.impressions)}</p>
                                      </div>
                                      <div>
                                        <p className="text-xs font-medium">Clicks</p>
                                        <p className="text-xs text-muted-foreground">{formatNumber(metric.clicks)}</p>
                                      </div>
                                      <div>
                                        <p className="text-xs font-medium">Conversions</p>
                                        <p className="text-xs text-muted-foreground">{formatNumber(metric.conversions)}</p>
                                      </div>
                                      <div>
                                        <p className="text-xs font-medium">Engagement</p>
                                        <p className="text-xs text-muted-foreground">{metric.engagement}%</p>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  )
} 
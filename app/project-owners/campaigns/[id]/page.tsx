import { getBaseUrl } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Users, DollarSign, BarChart2, TrendingUp, MousePointerClick, Share2, Clock, AlertTriangle } from "lucide-react"
import { formatCurrency, formatNumber } from "@/lib/format"
import { calculateCampaignPerformance } from '@/lib/metrics'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { getDb } from '@/lib/db'
import { campaigns } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { ErrorBoundary } from '@/components/ui/error-boundary'
import { Suspense } from 'react'

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
  applications: CampaignApplication[]
}

// Validate campaign ID
const validateCampaignId = (id: string | undefined): string => {
  if (!id || typeof id !== 'string') {
    throw new Error('Invalid campaign ID')
  }
  return id
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
  const campaign = await getCampaign(params.id)
  
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

export default async function CampaignDetailsPage({ params }: PageProps) {
  const campaign = await getCampaign(params.id)
  
  if (!campaign) {
    notFound()
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
    <div className="space-y-6">
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
            <div>
              <p className="text-xs text-muted-foreground mb-1">Platforms</p>
              <div className="flex gap-1">
                {platforms.map((platform: string) => (
                  <Badge key={platform} variant="outline" className="text-xs">
                    {platform}
                  </Badge>
                ))}
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

      <Card>
        <CardHeader>
          <CardTitle>Campaign Description</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{campaign.description}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Requirements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="font-medium">Minimum Followers</p>
            <p className="text-muted-foreground">{formatNumber(campaign.requirements?.minFollowers || 0)}</p>
          </div>
          <div>
            <p className="font-medium">Content Type</p>
            <p className="text-muted-foreground capitalize">{campaign.requirements?.contentType}</p>
          </div>
          <div>
            <p className="font-medium">Deliverables</p>
            <div className="flex gap-2 mt-1">
              {JSON.parse(campaign.requirements?.deliverables || '[]').map((deliverable: string) => (
                <Badge key={deliverable} variant="secondary">
                  {deliverable}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Applications ({campaign.applications?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {campaign.applications?.sort((a, b) => {
              const aEngagement = a.metrics?.reduce((sum, m) => sum + parseFloat(m.engagement), 0) || 0;
              const bEngagement = b.metrics?.reduce((sum, m) => sum + parseFloat(m.engagement), 0) || 0;
              return bEngagement - aEngagement;
            }).map((application) => (
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
                          <p className="font-medium">{application.creator.user.username}</p>
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
                          <p className="text-sm font-medium">Proposed Amount</p>
                          <p className="text-sm text-muted-foreground">
                            {application.proposedAmount ? formatCurrency(parseFloat(application.proposedAmount)) : 'Not specified'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  {application.metrics && application.metrics.length > 0 && (
                    <div className="mt-4 space-y-4">
                      <div className="grid grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm font-medium">Total Impressions</p>
                          <p className="text-sm text-muted-foreground">
                            {formatNumber(application.metrics.reduce((sum, m) => sum + m.impressions, 0))}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Total Clicks</p>
                          <p className="text-sm text-muted-foreground">
                            {formatNumber(application.metrics.reduce((sum, m) => sum + m.clicks, 0))}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Total Conversions</p>
                          <p className="text-sm text-muted-foreground">
                            {formatNumber(application.metrics.reduce((sum, m) => sum + m.conversions, 0))}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Avg. Engagement</p>
                          <p className="text-sm text-muted-foreground">
                            {(application.metrics.reduce((sum, m) => sum + parseFloat(m.engagement), 0) / application.metrics.length).toFixed(2)}%
                          </p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        {application.metrics.map((metric) => (
                          metric.postUrl && (
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
                          )
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 
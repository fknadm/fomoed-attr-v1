import { getBaseUrl } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Users, DollarSign, BarChart2, TrendingUp, MousePointerClick, Share2, Clock, AlertTriangle } from "lucide-react"
import { formatCurrency, formatNumber } from "@/lib/format"
import { calculateCampaignPerformance } from '@/lib/metrics'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'

interface CampaignApplication {
  id: string
  status: string
  proposal: string
  proposedAmount: string
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

// Validate campaign ID
const validateCampaignId = (id: string | undefined): string => {
  if (!id || typeof id !== 'string') {
    throw new Error('Invalid campaign ID')
  }
  return id
}

async function getCampaign(id: Promise<string> | string) {
  const resolvedId = await id
  const baseUrl = getBaseUrl()
  const res = await fetch(`${baseUrl}/api/campaigns/${resolvedId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  })

  if (!res.ok) {
    throw new Error('Failed to fetch campaign')
  }

  return res.json()
}

interface PageProps {
  params: Promise<{ id: string }> | { id: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

export async function generateMetadata(
  props: PageProps,
): Promise<Metadata> {
  try {
    const params = await props.params
    const campaign = await getCampaign(params.id)
    return {
      title: `${campaign.name} - Campaign Details`,
      description: campaign.description,
    }
  } catch (error) {
    return {
      title: 'Campaign Not Found',
      description: 'The requested campaign could not be found.',
    }
  }
}

export default async function CampaignDetailsPage(props: PageProps) {
  let campaign
  try {
    const params = await props.params
    campaign = await getCampaign(params.id)
  } catch (error) {
    notFound()
  }
  
  // Calculate metrics
  const metrics = {
    impressions: campaign.applications?.reduce((sum: number, app: any) => 
      sum + (app.metrics?.reduce((s: number, m: any) => s + m.impressions, 0) || 0), 0) || 0,
    clicks: campaign.applications?.reduce((sum: number, app: any) => 
      sum + (app.metrics?.reduce((s: number, m: any) => s + m.clicks, 0) || 0), 0) || 0,
    conversions: campaign.applications?.reduce((sum: number, app: any) => 
      sum + (app.metrics?.reduce((s: number, m: any) => s + m.conversions, 0) || 0), 0) || 0,
    engagement: campaign.applications?.reduce((sum: number, app: any) => 
      sum + (app.metrics?.reduce((s: number, m: any) => s + parseFloat(m.engagement), 0) || 0), 0) / 
      (campaign.applications?.reduce((sum: number, app: any) => sum + (app.metrics?.length || 0), 0) || 1) || 0,
    ctr: 0,
    conversionRate: 0,
    cpc: 0
  }

  metrics.ctr = metrics.impressions > 0 ? (metrics.clicks / metrics.impressions) * 100 : 0
  metrics.conversionRate = metrics.clicks > 0 ? (metrics.conversions / metrics.clicks) * 100 : 0
  metrics.cpc = metrics.clicks > 0 ? parseFloat(campaign.budget) / metrics.clicks : 0

  const platforms = JSON.parse(campaign.requirements?.requiredPlatforms || '[]')
  
  // Calculate performance metrics
  const performance = calculateCampaignPerformance(campaign)

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
            {campaign.applications?.sort((a: CampaignApplication, b: CampaignApplication) => {
              const aEngagement = a.metrics?.reduce((sum: number, m: any) => sum + parseFloat(m.engagement), 0) || 0;
              const bEngagement = b.metrics?.reduce((sum: number, m: any) => sum + parseFloat(m.engagement), 0) || 0;
              return bEngagement - aEngagement;
            }).map((application: CampaignApplication, index: number) => (
              <Card key={application.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      {index < 3 && (
                        <div className="absolute -top-2 -left-2 z-10">
                          {index === 0 ? (
                            <div className="w-8 h-8 relative">
                              <svg viewBox="0 0 24 24" className="w-full h-full">
                                <circle cx="12" cy="12" r="11" fill="url(#goldGradient)" stroke="#FCD34D" strokeWidth="1" />
                                <path d="M12 6l1.5 3 3.5.5-2.5 2.5.5 3.5L12 14l-3 1.5.5-3.5L7 9.5l3.5-.5L12 6z" fill="#FCD34D" />
                                <text x="12" y="15" textAnchor="middle" fontSize="10" fill="white" fontWeight="bold">1</text>
                                <defs>
                                  <linearGradient id="goldGradient" x1="0" y1="0" x2="1" y2="1">
                                    <stop offset="0%" stopColor="#FDB022" />
                                    <stop offset="50%" stopColor="#F59E0B" />
                                    <stop offset="100%" stopColor="#D97706" />
                                  </linearGradient>
                                </defs>
                              </svg>
                              <div className="absolute inset-0 bg-yellow-500/20 rounded-full animate-pulse" />
                            </div>
                          ) : index === 1 ? (
                            <div className="w-8 h-8 relative">
                              <svg viewBox="0 0 24 24" className="w-full h-full">
                                <circle cx="12" cy="12" r="11" fill="url(#silverGradient)" stroke="#94A3B8" strokeWidth="1" />
                                <path d="M12 6l1.5 3 3.5.5-2.5 2.5.5 3.5L12 14l-3 1.5.5-3.5L7 9.5l3.5-.5L12 6z" fill="#94A3B8" />
                                <text x="12" y="15" textAnchor="middle" fontSize="10" fill="white" fontWeight="bold">2</text>
                                <defs>
                                  <linearGradient id="silverGradient" x1="0" y1="0" x2="1" y2="1">
                                    <stop offset="0%" stopColor="#CBD5E1" />
                                    <stop offset="50%" stopColor="#94A3B8" />
                                    <stop offset="100%" stopColor="#64748B" />
                                  </linearGradient>
                                </defs>
                              </svg>
                              <div className="absolute inset-0 bg-slate-500/20 rounded-full animate-pulse" />
                            </div>
                          ) : (
                            <div className="w-8 h-8 relative">
                              <svg viewBox="0 0 24 24" className="w-full h-full">
                                <circle cx="12" cy="12" r="11" fill="url(#bronzeGradient)" stroke="#B45309" strokeWidth="1" />
                                <path d="M12 6l1.5 3 3.5.5-2.5 2.5.5 3.5L12 14l-3 1.5.5-3.5L7 9.5l3.5-.5L12 6z" fill="#B45309" />
                                <text x="12" y="15" textAnchor="middle" fontSize="10" fill="white" fontWeight="bold">3</text>
                                <defs>
                                  <linearGradient id="bronzeGradient" x1="0" y1="0" x2="1" y2="1">
                                    <stop offset="0%" stopColor="#D97706" />
                                    <stop offset="50%" stopColor="#B45309" />
                                    <stop offset="100%" stopColor="#92400E" />
                                  </linearGradient>
                                </defs>
                              </svg>
                              <div className="absolute inset-0 bg-amber-800/20 rounded-full animate-pulse" />
                            </div>
                          )}
                        </div>
                      )}
                      <div className="relative h-12 w-12 flex-shrink-0">
                        <div className={`absolute inset-0 rounded-full 
                          ${index === 0 ? 'bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 animate-pulse' :
                            index === 1 ? 'bg-gradient-to-br from-slate-300 via-slate-400 to-slate-500 animate-pulse' :
                            index === 2 ? 'bg-gradient-to-br from-amber-700 via-amber-800 to-amber-900 animate-pulse' :
                            'bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 animate-pulse'}`}
                        />
                        <img
                          src={application.creator.user.avatar || `https://api.dicebear.com/7.x/shapes/svg?seed=${application.creator.user.username}`}
                          alt={application.creator.user.username}
                          className="absolute inset-[2px] rounded-full object-cover bg-black"
                        />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-lg">{application.creator.user.username}</p>
                            {index < 3 && (
                              <div className={`px-2 py-1 rounded-full text-xs font-semibold
                                ${index === 0 ? 'bg-yellow-500/10 text-yellow-500' :
                                  index === 1 ? 'bg-slate-500/10 text-slate-500' :
                                  'bg-amber-800/10 text-amber-800'}`}
                              >
                                {index === 0 ? 'Gold Tier' : index === 1 ? 'Silver Tier' : 'Bronze Tier'}
                              </div>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{application.creator.bio}</p>
                          <div className="flex items-center gap-2 mt-1">
                            {application.creator.twitterHandle && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                                </svg>
                                {application.creator.twitterHandle}
                              </div>
                            )}
                            {application.creator.twitterFollowers && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                  <circle cx="9" cy="7" r="4" />
                                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                </svg>
                                {application.creator.twitterFollowers.toLocaleString()} followers
                              </div>
                            )}
                          </div>
                        </div>
                        <Badge 
                          variant={
                            application.status === 'approved' ? 'default' :
                            application.status === 'pending' ? 'secondary' :
                            'destructive'
                          }
                          className={`capitalize ${
                            application.status === 'approved' ? 'bg-green-500/10 text-green-500' :
                            application.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' :
                            'bg-red-500/10 text-red-500'
                          }`}
                        >
                          {application.status}
                        </Badge>
                      </div>
                      <div className="mt-4 space-y-2">
                        <div>
                          <p className="text-sm font-medium">Proposal</p>
                          <p className="text-sm text-muted-foreground">{application.proposal}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Proposed Amount</p>
                          <p className="text-sm text-muted-foreground">{formatCurrency(parseFloat(application.proposedAmount))}</p>
                        </div>
                      </div>
                      {application.metrics && application.metrics.length > 0 && (
                        <div className="mt-4 space-y-4">
                          <div className="grid grid-cols-4 gap-4">
                            <div>
                              <p className="text-sm font-medium">Total Impressions</p>
                              <p className="text-sm text-muted-foreground">
                                {formatNumber(application.metrics.reduce((sum: number, m: any) => sum + m.impressions, 0))}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Total Clicks</p>
                              <p className="text-sm text-muted-foreground">
                                {formatNumber(application.metrics.reduce((sum: number, m: any) => sum + m.clicks, 0))}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Total Conversions</p>
                              <p className="text-sm text-muted-foreground">
                                {formatNumber(application.metrics.reduce((sum: number, m: any) => sum + m.conversions, 0))}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Avg. Engagement</p>
                              <p className="text-sm text-muted-foreground">
                                {(application.metrics.reduce((sum: number, m: any) => sum + parseFloat(m.engagement), 0) / application.metrics.length).toFixed(2)}%
                              </p>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium mb-2">Social Media Posts</p>
                            <div className="space-y-3">
                              {application.metrics.map((metric: any) => (
                                metric.postUrl && (
                                  <div key={metric.id} className="bg-muted/50 rounded-lg p-3">
                                    <div className="flex items-center gap-2 mb-2">
                                      {metric.platform === 'twitter' ? (
                                        <div className="flex items-center gap-2 bg-[#1DA1F2]/10 px-2 py-1 rounded-full">
                                          <svg className="w-4 h-4 text-[#1DA1F2]" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                                          </svg>
                                          <span className="text-xs font-medium text-[#1DA1F2]">Twitter</span>
                                        </div>
                                      ) : metric.platform === 'instagram' ? (
                                        <div className="flex items-center gap-2 bg-[#E4405F]/10 px-2 py-1 rounded-full">
                                          <svg className="w-4 h-4 text-[#E4405F]" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.897 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.897-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/>
                                          </svg>
                                          <span className="text-xs font-medium text-[#E4405F]">Instagram</span>
                                        </div>
                                      ) : metric.platform === 'youtube' ? (
                                        <div className="flex items-center gap-2 bg-[#FF0000]/10 px-2 py-1 rounded-full">
                                          <svg className="w-4 h-4 text-[#FF0000]" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                                          </svg>
                                          <span className="text-xs font-medium text-[#FF0000]">YouTube</span>
                                        </div>
                                      ) : metric.platform === 'tiktok' ? (
                                        <div className="flex items-center gap-2 bg-[#FF0050]/10 px-2 py-1 rounded-full">
                                          <svg className="w-4 h-4" viewBox="0 0 24 24">
                                            <path fill="#FF0050" d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                                          </svg>
                                          <span className="text-xs font-medium text-[#FF0050]">TikTok</span>
                                        </div>
                                      ) : metric.platform === 'discord' ? (
                                        <div className="flex items-center gap-2 bg-[#5865F2]/10 px-2 py-1 rounded-full">
                                          <svg className="w-4 h-4 text-[#5865F2]" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                                          </svg>
                                          <span className="text-xs font-medium text-[#5865F2]">Discord</span>
                                        </div>
                                      ) : (
                                        <div className="flex items-center gap-2 bg-muted px-2 py-1 rounded-full">
                                          <svg className="w-4 h-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                          </svg>
                                          <span className="text-xs font-medium text-muted-foreground">Link</span>
                                        </div>
                                      )}
                                      <div className="text-sm text-muted-foreground">
                                        {metric.platform === 'twitter' ? 'Tweet' :
                                         metric.platform === 'instagram' ? 'Post' :
                                         metric.platform === 'youtube' ? 'Video' :
                                         metric.platform === 'tiktok' ? 'Video' :
                                         metric.platform === 'discord' ? 'Message' :
                                         'Post'}
                                      </div>
                                    </div>
                                    <a
                                      href={metric.postUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-sm text-blue-500 hover:text-blue-600 hover:underline mb-2 block bg-blue-500/5 rounded-md px-3 py-2 hover:bg-blue-500/10 transition-colors"
                                    >
                                      {metric.postUrl.split('/').slice(-1)[0]}
                                    </a>
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
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 
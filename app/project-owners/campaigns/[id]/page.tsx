import { getBaseUrl } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Users, DollarSign, BarChart2, TrendingUp, MousePointerClick, Share2 } from "lucide-react"
import { formatCurrency, formatNumber } from "@/lib/format"

async function getCampaign(id: string) {
  const baseUrl = getBaseUrl()
  const res = await fetch(`${baseUrl}/api/campaigns/${id}`, {
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

export default async function CampaignDetailsPage({ params }: { params: { id: string } }) {
  const campaign = await getCampaign(params.id)
  
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
            {campaign.applications?.map((application: any) => (
              <Card key={application.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{application.creator.user.username}</p>
                      <p className="text-sm text-muted-foreground">{application.creator.bio}</p>
                    </div>
                    <Badge 
                      variant={
                        application.status === 'approved' ? 'default' :
                        application.status === 'pending' ? 'secondary' :
                        'destructive'
                      }
                      className="capitalize"
                    >
                      {application.status}
                    </Badge>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm font-medium">Proposal</p>
                    <p className="text-sm text-muted-foreground">{application.proposal}</p>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm font-medium">Proposed Amount</p>
                    <p className="text-sm text-muted-foreground">{formatCurrency(parseFloat(application.proposedAmount))}</p>
                  </div>
                  {application.metrics && application.metrics.length > 0 && (
                    <div className="mt-4 grid grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm font-medium">Impressions</p>
                        <p className="text-sm text-muted-foreground">
                          {formatNumber(application.metrics.reduce((sum: number, m: any) => sum + m.impressions, 0))}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Clicks</p>
                        <p className="text-sm text-muted-foreground">
                          {formatNumber(application.metrics.reduce((sum: number, m: any) => sum + m.clicks, 0))}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Conversions</p>
                        <p className="text-sm text-muted-foreground">
                          {formatNumber(application.metrics.reduce((sum: number, m: any) => sum + m.conversions, 0))}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Engagement</p>
                        <p className="text-sm text-muted-foreground">
                          {(application.metrics.reduce((sum: number, m: any) => sum + parseFloat(m.engagement), 0) / application.metrics.length).toFixed(2)}%
                        </p>
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
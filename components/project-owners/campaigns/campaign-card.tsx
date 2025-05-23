'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Users, DollarSign, BarChart2, TrendingUp, MousePointerClick, Share2, Building2 } from "lucide-react"
import Link from "next/link"
import { formatCurrency, formatNumber } from "@/lib/format"

interface CampaignMetrics {
  impressions: number
  clicks: number
  conversions: number
  engagement: number
  ctr: number
  conversionRate: number
  cpc: number
}

interface CampaignCardProps {
  id: string
  name: string
  status: string
  budget: string
  cpmValue: string
  startDate: string
  endDate: string
  projectName: string
  metrics: CampaignMetrics
  platforms: string | string[]
  applicationsCount: number
  monetizationPolicy?: {
    id: string
    name: string
    baseRateMultiplier: string
  } | null
}

// Format date in a consistent way for both server and client
function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toISOString().split('T')[0] // YYYY-MM-DD format
}

export function CampaignCard({
  id,
  name,
  status,
  budget,
  cpmValue,
  startDate,
  endDate,
  projectName,
  metrics,
  platforms,
  applicationsCount,
  monetizationPolicy,
}: CampaignCardProps) {
  // Parse platforms if it's a string
  const parsedPlatforms = typeof platforms === 'string' ? JSON.parse(platforms) : platforms

  return (
    <Card className="overflow-hidden hover:bg-muted/5 transition-colors">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <CardTitle className="text-lg font-bold">{name}</CardTitle>
              <Badge 
                variant={
                  status === 'active' ? 'default' :
                  status === 'draft' ? 'secondary' :
                  'destructive'
                }
                className={`capitalize ${
                  status === 'active' ? 'bg-green-500/10 text-green-500' :
                  status === 'draft' ? 'bg-yellow-500/10 text-yellow-500' :
                  'bg-red-500/10 text-red-500'
                }`}
              >
                {status}
              </Badge>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <Link 
                href={`/project-owners/projects/${id}`}
                className="text-sm font-medium text-primary hover:underline flex items-center gap-1"
              >
                {projectName}
                <span className="text-xs text-muted-foreground">(View Project)</span>
              </Link>
            </div>
            {monetizationPolicy && (
              <div className="text-sm text-muted-foreground mt-1">
                Policy: <Link href={`/project-owners/monetization?policy=${monetizationPolicy.id}`} className="text-primary hover:underline">{monetizationPolicy.name}</Link>
                <span className="ml-2">({parseFloat(monetizationPolicy.baseRateMultiplier).toFixed(1)}x)</span>
              </div>
            )}
          </div>
          <Link
            href={`/project-owners/campaigns/${id}`}
            className="text-sm font-medium text-primary hover:underline"
          >
            View Details
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-4 border-b">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">{formatCurrency(parseFloat(budget))}</p>
              <p className="text-xs text-muted-foreground">Budget</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">{formatCurrency(parseFloat(cpmValue))}</p>
              <p className="text-xs text-muted-foreground">Set CPM</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">{applicationsCount}</p>
              <p className="text-xs text-muted-foreground">Applications</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">
                {formatDate(startDate)} - {formatDate(endDate)}
              </p>
              <p className="text-xs text-muted-foreground">Timeline</p>
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Platforms</p>
            <div className="flex gap-1">
              {parsedPlatforms.map((platform: string) => (
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
  )
} 
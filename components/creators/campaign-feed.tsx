'use client'

import { useState, useEffect } from 'react'
import { Search, Twitter, Globe, MessageCircle, Send, Building2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { GradientButton } from '@/components/ui/gradient-button'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Image from 'next/image'

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
    verifiedOnly?: boolean
    tier?: string
  } | null
  monetizationPolicies: Array<{
    policy: {
      id: string
      name: string
      baseRateMultiplier: string
    }
  }>
  applications: Array<{
    id: string
    status: string
    creator: {
      user: {
        username: string
      }
    }
    metrics: Array<{
      impressions: number | null
      clicks: number | null
      conversions: number | null
      engagement: string | null
    }>
  }>
  heroImage?: string
  socialLinks?: {
    twitter?: string
    discord?: string
    telegram?: string
    website?: string
  }
}

interface CampaignFeedProps {
  initialCampaigns?: Campaign[]
}

export function CampaignFeed({ initialCampaigns = [] }: CampaignFeedProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({
    platforms: [] as string[],
    verifiedOnly: false,
    tier: 'all',
  })
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    async function fetchCampaigns() {
      try {
        console.log('🔄 Fetching campaigns...')
        const res = await fetch('/api/campaigns?status=active')
        if (!res.ok) {
          throw new Error('Failed to fetch campaigns')
        }
        const data = await res.json()
        console.log('✅ Fetched campaigns:', data)
        if (isMounted) {
          setCampaigns(data)
          setIsLoading(false)
        }
      } catch (error) {
        console.error('❌ Error fetching campaigns:', error)
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    if (!initialCampaigns || initialCampaigns.length === 0) {
      fetchCampaigns()
    } else {
      console.log('📦 Using initial campaigns:', initialCampaigns)
      setCampaigns(initialCampaigns)
      setIsLoading(false)
    }

    return () => {
      isMounted = false
    }
  }, [])

  console.log('📦 Current campaigns in state:', campaigns)

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-md border border-dashed p-8 text-center animate-in fade-in-50">
        <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
          <h3 className="mb-2 text-lg font-semibold">Loading campaigns...</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            Please wait while we fetch the latest campaigns.
          </p>
        </div>
      </div>
    )
  }

  const filteredCampaigns = campaigns.filter((campaign: Campaign) => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      campaign.description.toLowerCase().includes(searchQuery.toLowerCase())
    
    const campaignPlatforms = campaign.requirements?.requiredPlatforms 
      ? JSON.parse(campaign.requirements.requiredPlatforms) as string[]
      : []
    const matchesPlatforms = filters.platforms.length === 0 || 
      filters.platforms.some(platform => campaignPlatforms.includes(platform))

    const matchesVerified = !filters.verifiedOnly || campaign.requirements?.verifiedOnly
    const matchesTier = filters.tier === 'all' || campaign.requirements?.tier === filters.tier

    return matchesSearch && matchesPlatforms && matchesVerified && matchesTier
  })

  console.log('🔍 Filtered campaigns:', filteredCampaigns)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search campaigns..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9"
          />
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Checkbox
              id="verified"
              checked={filters.verifiedOnly}
              onCheckedChange={(checked) => 
                setFilters(prev => ({ ...prev, verifiedOnly: checked as boolean }))
              }
            />
            <label
              htmlFor="verified"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Verified Only
            </label>
          </div>
          <Select
            value={filters.tier}
            onValueChange={(value) => setFilters(prev => ({ ...prev, tier: value }))}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select tier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tiers</SelectItem>
              <SelectItem value="S">S Tier</SelectItem>
              <SelectItem value="A">A Tier</SelectItem>
              <SelectItem value="B">B Tier</SelectItem>
              <SelectItem value="C">C Tier</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-6">
        {!campaigns || campaigns.length === 0 ? (
          <div className="flex min-h-[400px] flex-col items-center justify-center rounded-md border border-dashed p-8 text-center animate-in fade-in-50">
            <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
              <h3 className="mb-2 text-lg font-semibold">No campaigns found</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Try adjusting your search or filters to find what you're looking for.
              </p>
            </div>
          </div>
        ) : filteredCampaigns.length === 0 ? (
          <div className="flex min-h-[400px] flex-col items-center justify-center rounded-md border border-dashed p-8 text-center animate-in fade-in-50">
            <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
              <h3 className="mb-2 text-lg font-semibold">No matching campaigns</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Try adjusting your search or filters to find what you're looking for.
              </p>
            </div>
          </div>
        ) : (
          filteredCampaigns.map((campaign: Campaign) => {
            console.log('🎯 Rendering campaign:', campaign.id, campaign.name)
            const platforms = campaign.requirements?.requiredPlatforms 
              ? JSON.parse(campaign.requirements.requiredPlatforms) as string[]
              : []

            return (
              <div
                key={campaign.id}
                className="flex flex-col gap-4 rounded-lg border overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Hero Image Section */}
                <div className="relative h-48 w-full">
                  {campaign.heroImage ? (
                    <Image
                      src={campaign.heroImage}
                      alt={campaign.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-[#059669] to-[#2563eb]" />
                  )}
                  <div className="absolute inset-0 bg-black/40" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <h3 className="text-2xl font-bold mb-2">{campaign.name}</h3>
                    <p className="text-sm text-gray-200 line-clamp-2">
                      {campaign.description}
                    </p>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-6 space-y-4">
                  {/* Project and Status */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <Link 
                          href={`/creators/projects/${campaign.projectId}`}
                          className="text-sm font-medium text-primary hover:underline flex items-center gap-1"
                        >
                          {campaign.project.name}
                          <span className="text-xs text-muted-foreground">(View Project)</span>
                        </Link>
                      </div>
                      <span className="text-sm text-muted-foreground">•</span>
                      <span className="text-sm text-muted-foreground">
                        Min. Followers: {campaign.requirements?.minFollowers?.toLocaleString() || 0}
                      </span>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      campaign.status === 'active' ? 'bg-green-500/10 text-green-500' :
                      campaign.status === 'draft' ? 'bg-yellow-500/10 text-yellow-500' :
                      'bg-red-500/10 text-red-500'
                    }`}>
                      {campaign.status}
                    </span>
                  </div>

                  {/* Budget and CPM */}
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Budget:</span>
                      <span className="text-muted-foreground">
                        ${parseInt(campaign.budget).toLocaleString()}
                      </span>
                    </div>
                    <span className="text-muted-foreground">•</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">CPM:</span>
                      <span className="text-muted-foreground">
                        ${parseFloat(campaign.cpmValue).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Platforms */}
                  <div className="flex flex-wrap gap-2">
                    {platforms.map((platform) => (
                      <span
                        key={platform}
                        className="rounded-full bg-[#2A2625] px-2.5 py-0.5 text-xs font-medium text-white"
                      >
                        {platform}
                      </span>
                    ))}
                  </div>

                  {/* Social Links */}
                  {campaign.socialLinks && Object.keys(campaign.socialLinks).length > 0 && (
                    <div className="flex gap-2">
                      {campaign.socialLinks.twitter && (
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          asChild
                        >
                          <a href={campaign.socialLinks.twitter} target="_blank" rel="noopener noreferrer">
                            <Twitter className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                      {campaign.socialLinks.discord && (
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          asChild
                        >
                          <a href={campaign.socialLinks.discord} target="_blank" rel="noopener noreferrer">
                            <MessageCircle className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                      {campaign.socialLinks.telegram && (
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          asChild
                        >
                          <a href={campaign.socialLinks.telegram} target="_blank" rel="noopener noreferrer">
                            <Send className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                      {campaign.socialLinks.website && (
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          asChild
                        >
                          <a href={campaign.socialLinks.website} target="_blank" rel="noopener noreferrer">
                            <Globe className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                  )}

                  {/* Apply Button */}
                  <div className="flex justify-end">
                    <Link href={`/creators/campaigns/${campaign.id}/apply`}>
                      <GradientButton>
                        Apply Now
                      </GradientButton>
                    </Link>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
} 
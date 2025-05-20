import { GradientButton } from "@/components/ui/gradient-button"
import Link from "next/link"

async function getAvailableCampaigns() {
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https'
  const host = process.env.VERCEL_URL || process.env.NEXT_PUBLIC_APP_URL || 'localhost:3000'
  const baseUrl = `${protocol}://${host}`

  const res = await fetch(`${baseUrl}/api/campaigns?status=active`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    cache: 'no-store'
  })

  if (!res.ok) {
    throw new Error('Failed to fetch available campaigns')
  }

  return res.json()
}

export async function AvailableCampaigns() {
  const campaigns = await getAvailableCampaigns()

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          <h2 className="text-2xl font-semibold tracking-tight">
            Available Campaigns
          </h2>
          <div className="ml-2 flex h-7 items-center justify-center rounded-full bg-[#2A2625] px-3 text-xs font-medium">
            {campaigns.length}
          </div>
        </div>
      </div>
      <div className="divide-y divide-[#2A2625] rounded-md border border-[#2A2625]">
        {campaigns.length === 0 ? (
          <div className="p-8 text-center">
            <h3 className="mb-2 text-xl font-semibold">No campaigns available</h3>
            <p className="text-muted-foreground">
              Check back later for new campaign opportunities.
            </p>
          </div>
        ) : (
          campaigns.map((campaign: any) => {
            const platforms = campaign.requirements?.requiredPlatforms 
              ? JSON.parse(campaign.requirements.requiredPlatforms) as string[]
              : []

            return (
              <div
                key={campaign.id}
                className="flex items-center justify-between p-6"
              >
                <div>
                  <div className="flex items-center gap-4">
                    <h3 className="font-semibold text-white">{campaign.name}</h3>
                    <span className="rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs font-medium text-green-500">
                      Active
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {campaign.description}
                  </p>
                  <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Budget: ${campaign.budget.toLocaleString()}</span>
                    <span>•</span>
                    <span>Project: {campaign.project.name}</span>
                    <span>•</span>
                    <span>Min. Followers: {campaign.requirements?.minFollowers?.toLocaleString() || 0}</span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {platforms.map((platform: string) => (
                      <span
                        key={platform}
                        className="rounded-full bg-[#2A2625] px-2.5 py-0.5 text-xs font-medium text-white"
                      >
                        {platform}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="ml-4">
                  <Link href={`/creators/campaigns/${campaign.id}/apply`}>
                    <GradientButton>
                      Apply Now
                    </GradientButton>
                  </Link>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
} 
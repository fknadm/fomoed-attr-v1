import { Suspense } from 'react'
import { DashboardShell } from '@/components/ui/dashboard-shell'
import { CampaignFeed } from '@/components/creators/campaign-feed'
import { CreatorLoading } from '@/components/creators/creator-loading'

export const dynamic = 'force-dynamic'

export default async function CreatorsPage() {
  return (
    <DashboardShell>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Campaigns Feed</h1>
          <p className="text-muted-foreground">
            Discover and apply for campaigns that match your influence.
          </p>
        </div>
      </div>
      <div className="grid gap-8">
        <Suspense fallback={<CreatorLoading />}>
          <CampaignFeed />
        </Suspense>
      </div>
    </DashboardShell>
  )
} 
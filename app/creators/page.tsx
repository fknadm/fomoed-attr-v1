import { Suspense } from 'react'
import { DashboardShell } from '@/components/ui/dashboard-shell'
import { CreatorProfile } from '@/components/creators/creator-profile'
import { AvailableCampaigns } from '@/components/creators/available-campaigns'
import { CreatorLoading } from '@/components/creators/creator-loading'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function CreatorsPage() {
  return (
    <DashboardShell>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Creator Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your profile and find campaigns that match your influence.
          </p>
        </div>
      </div>
      <div className="grid gap-8">
        <Suspense fallback={<CreatorLoading />}>
          <CreatorProfile />
          <AvailableCampaigns />
        </Suspense>
      </div>
    </DashboardShell>
  )
} 
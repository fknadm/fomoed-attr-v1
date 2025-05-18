import { Suspense } from 'react'
import { DashboardShell } from '@/components/ui/dashboard-shell'
import { CampaignsList } from '@/components/project-owners/campaigns/campaigns-list'
import { CreateCampaignButton } from '@/components/project-owners/campaigns/create-campaign-button'
import { ErrorBoundary } from '@/components/ui/error-boundary'

export const dynamic = 'force-dynamic'

function CampaignsLoading() {
  return (
    <div className="grid gap-6">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="h-[200px] rounded-lg border border-dashed animate-pulse"
        />
      ))}
    </div>
  )
}

export default async function ProjectOwnersPage() {
  return (
    <DashboardShell>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Campaigns</h1>
          <p className="text-muted-foreground">
            Manage your marketing campaigns and track their performance.
          </p>
        </div>
        <CreateCampaignButton />
      </div>
      <div className="grid gap-8">
        <ErrorBoundary>
          <Suspense fallback={<CampaignsLoading />}>
            <CampaignsList />
          </Suspense>
        </ErrorBoundary>
      </div>
    </DashboardShell>
  )
} 
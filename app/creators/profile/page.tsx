import { Suspense } from 'react'
import { DashboardShell } from '@/components/ui/dashboard-shell'
import { CreatorProfile } from '@/components/creators/creator-profile'
import { CreatorLoading } from '@/components/creators/creator-loading'

export const dynamic = 'force-dynamic'

export default async function ProfilePage() {
  return (
    <DashboardShell>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">My Profile</h1>
          <p className="text-muted-foreground">
            Manage your profile and social media presence.
          </p>
        </div>
      </div>
      <div className="grid gap-8">
        <Suspense fallback={<CreatorLoading />}>
          <CreatorProfile />
        </Suspense>
      </div>
    </DashboardShell>
  )
} 
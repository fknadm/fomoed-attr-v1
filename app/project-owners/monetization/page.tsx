import { DashboardShell } from '@/components/ui/dashboard-shell'
import { MonetizationPoliciesList } from '@/components/project-owners/monetization/policies-list'
import { CreatePolicyButton } from '@/components/project-owners/monetization/create-policy-button'
import { Suspense } from 'react'
import { ErrorBoundary } from '@/components/ui/error-boundary'

export const dynamic = 'force-dynamic'

function PoliciesLoading() {
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

export default async function MonetizationPoliciesPage() {
  return (
    <DashboardShell>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Monetization Policies</h1>
          <p className="text-muted-foreground">
            Manage your campaign monetization policies and bonus structures.
          </p>
        </div>
        <CreatePolicyButton />
      </div>
      <div className="grid gap-8">
        <ErrorBoundary>
          <Suspense fallback={<PoliciesLoading />}>
            <MonetizationPoliciesList />
          </Suspense>
        </ErrorBoundary>
      </div>
    </DashboardShell>
  )
} 
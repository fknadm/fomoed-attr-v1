import { Suspense } from 'react'
import { DashboardShell } from '@/components/ui/dashboard-shell'
import { ProjectsList } from '@/components/project-owners/projects/projects-list'
import { CreateProjectButton } from '@/components/project-owners/projects/create-project-button'
import { ErrorBoundary } from '@/components/ui/error-boundary'

export const dynamic = 'force-dynamic'

export default function ProjectsPage() {
  return (
    <DashboardShell>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
          <p className="text-muted-foreground">
            Manage your projects and their campaigns
          </p>
        </div>
        <CreateProjectButton />
      </div>

      <div className="grid gap-6">
        <ErrorBoundary>
          <Suspense fallback={<div>Loading projects...</div>}>
            <ProjectsList />
          </Suspense>
        </ErrorBoundary>
      </div>
    </DashboardShell>
  )
} 
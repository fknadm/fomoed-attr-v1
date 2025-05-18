import { notFound } from 'next/navigation'
import { DashboardShell } from '@/components/ui/dashboard-shell'
import { CampaignApplicationForm } from '@/components/creators/campaign-application-form'

async function getCampaign(id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/campaigns/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!res.ok) {
    if (res.status === 404) {
      notFound()
    }
    throw new Error('Failed to fetch campaign')
  }

  return res.json()
}

export default async function CampaignApplicationPage({ params }: { params: { id: string } }) {
  const campaign = await getCampaign(params.id)

  return (
    <DashboardShell>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Apply for Campaign</h1>
          <p className="text-muted-foreground">
            Submit your application for {campaign.name}
          </p>
        </div>
      </div>
      <div className="grid gap-8">
        <CampaignApplicationForm campaign={campaign} />
      </div>
    </DashboardShell>
  )
} 
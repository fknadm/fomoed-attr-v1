import { getCampaign } from "@/lib/campaigns"
import { notFound } from "next/navigation"
import { CampaignForm } from "@/components/project-owners/campaigns/campaign-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface PageProps {
  params: { id: string }
}

export default async function EditCampaignPage({ params }: PageProps) {
  const campaign = await getCampaign(params.id)
  
  if (!campaign) {
    notFound()
  }

  return (
    <div className="container py-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Edit Campaign</CardTitle>
        </CardHeader>
        <CardContent>
          <CampaignForm campaign={campaign} />
        </CardContent>
      </Card>
    </div>
  )
} 
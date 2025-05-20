import { CampaignFeed } from '@/components/creators/campaign-feed'

export default function FeedPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Available Campaigns</h1>
        <p className="text-muted-foreground">
          Browse and apply to campaigns that match your profile
        </p>
      </div>
      <CampaignFeed />
    </div>
  )
} 
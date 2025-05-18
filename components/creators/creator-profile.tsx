import { GradientButton } from "@/components/ui/gradient-button"
import { Edit } from "@/components/ui/icons"

async function getCreatorProfile() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/creators/me`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!res.ok) {
    throw new Error('Failed to fetch creator profile')
  }

  return res.json()
}

export async function CreatorProfile() {
  const profile = await getCreatorProfile()

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold tracking-tight">
          Profile
        </h2>
        <GradientButton>
          <Edit className="mr-2 h-4 w-4" />
          Edit Profile
        </GradientButton>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border border-[#2A2625] p-6">
          <h3 className="mb-4 text-lg font-medium">Personal Info</h3>
          <dl className="grid gap-4">
            <div>
              <dt className="text-sm text-muted-foreground">Name</dt>
              <dd className="text-white">{profile.user.name}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Email</dt>
              <dd className="text-white">{profile.user.email}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Bio</dt>
              <dd className="text-white">{profile.bio}</dd>
            </div>
          </dl>
        </div>
        <div className="rounded-lg border border-[#2A2625] p-6">
          <h3 className="mb-4 text-lg font-medium">Social Media</h3>
          <dl className="grid gap-4">
            <div>
              <dt className="text-sm text-muted-foreground">Twitter</dt>
              <dd className="text-white">
                @{profile.twitterHandle}
                <span className="ml-2 text-sm text-muted-foreground">
                  {profile.twitterFollowers.toLocaleString()} followers
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Discord</dt>
              <dd className="text-white">{profile.discordHandle}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Website</dt>
              <dd className="text-white">{profile.websiteUrl}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  )
} 
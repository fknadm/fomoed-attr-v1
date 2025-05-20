import { GradientButton } from "@/components/ui/gradient-button"
import { Edit } from "@/components/ui/icons"
import { Twitter, Globe, MessageCircle } from "lucide-react"
import Image from "next/image"

async function getCreatorProfile() {
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https'
  const host = process.env.VERCEL_URL || process.env.NEXT_PUBLIC_APP_URL || 'localhost:3000'
  const baseUrl = `${protocol}://${host}`

  const res = await fetch(`${baseUrl}/api/creators/me`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    cache: 'no-store'
  })

  if (!res.ok) {
    const errorText = await res.text()
    console.error(`Failed to fetch creator profile: ${res.status} ${res.statusText}`, errorText)
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
          <div className="mb-6 flex items-center gap-4">
            <div className="relative h-20 w-20 overflow-hidden rounded-full border-2 border-[#2A2625]">
              <Image
                src={profile.user.avatar || '/placeholder-avatar.png'}
                alt={profile.user.name}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h3 className="text-xl font-semibold">{profile.user.name}</h3>
              <p className="text-sm text-muted-foreground">{profile.user.email}</p>
            </div>
          </div>
          <dl className="grid gap-4">
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
              <dd className="flex items-center gap-2 text-white">
                <Twitter className="h-4 w-4" />
                <a 
                  href={`https://twitter.com/${profile.twitterHandle?.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  {profile.twitterHandle}
                </a>
                <span className="text-sm text-muted-foreground">
                  {profile.twitterFollowers?.toLocaleString()} followers
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Discord</dt>
              <dd className="flex items-center gap-2 text-white">
                <MessageCircle className="h-4 w-4" />
                <span>{profile.discordHandle}</span>
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Website</dt>
              <dd className="flex items-center gap-2 text-white">
                <Globe className="h-4 w-4" />
                <a 
                  href={profile.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  {profile.websiteUrl}
                </a>
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  )
} 
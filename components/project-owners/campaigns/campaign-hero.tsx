'use client'

import { Twitter, Globe, MessageCircle, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface SocialLink {
  twitter?: string
  discord?: string
  telegram?: string
  website?: string
}

interface CampaignHeroProps {
  title: string
  description: string
  heroImage: string | null
  socialLinks: SocialLink
  className?: string
}

export function CampaignHero({
  title,
  description,
  heroImage,
  socialLinks,
  className,
}: CampaignHeroProps) {
  // Use a fixed gradient value to avoid hydration errors
  const gradient = "from-[#059669] to-[#2563eb]";

  return (
    <div className={cn('relative w-full h-[400px] overflow-hidden', className)}>
      {/* Hero Image Background or Gradient */}
      <div
        className={cn(
          "absolute inset-0 bg-cover bg-center bg-no-repeat",
          !heroImage && `bg-gradient-to-br ${gradient}`
        )}
        style={heroImage ? { backgroundImage: `url(${heroImage})` } : {}}
      >
        {/* Pattern overlay for gradient background */}
        {!heroImage && (
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        )}
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/90" />
      </div>

      {/* Content */}
      <div className="relative h-full container mx-auto px-4 flex flex-col justify-end pb-8">
        <div className="max-w-3xl">
          <h1 className="text-4xl font-bold text-white mb-4">{title}</h1>
          <p className="text-lg text-gray-200 mb-6">{description}</p>

          {/* Social Links */}
          <div className="flex gap-4">
            {socialLinks.twitter && (
              <Button
                variant="outline"
                size="icon"
                className="bg-white/10 hover:bg-white/20 border-white/20"
                asChild
              >
                <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer">
                  <Twitter className="h-5 w-5 text-white" />
                </a>
              </Button>
            )}
            {socialLinks.discord && (
              <Button
                variant="outline"
                size="icon"
                className="bg-white/10 hover:bg-white/20 border-white/20"
                asChild
              >
                <a href={socialLinks.discord} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="h-5 w-5 text-white" />
                </a>
              </Button>
            )}
            {socialLinks.telegram && (
              <Button
                variant="outline"
                size="icon"
                className="bg-white/10 hover:bg-white/20 border-white/20"
                asChild
              >
                <a href={socialLinks.telegram} target="_blank" rel="noopener noreferrer">
                  <Send className="h-5 w-5 text-white" />
                </a>
              </Button>
            )}
            {socialLinks.website && (
              <Button
                variant="outline"
                size="icon"
                className="bg-white/10 hover:bg-white/20 border-white/20"
                asChild
              >
                <a href={socialLinks.website} target="_blank" rel="noopener noreferrer">
                  <Globe className="h-5 w-5 text-white" />
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 
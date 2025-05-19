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
  heroImage: string
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
  return (
    <div className={cn('relative w-full h-[400px] overflow-hidden', className)}>
      {/* Hero Image Background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${heroImage})`,
        }}
      >
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
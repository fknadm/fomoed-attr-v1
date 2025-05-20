import { notFound } from 'next/navigation'
import { DashboardShell } from '@/components/ui/dashboard-shell'
import { getDb } from '@/lib/db'
import { projects } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Globe, Twitter, MessageCircle, Building2 } from 'lucide-react'
import Link from 'next/link'
import { CreateCampaignButton } from '@/components/project-owners/campaigns/create-campaign-button'
import { CampaignHero } from '@/components/project-owners/campaigns/campaign-hero'

interface PageProps {
  params: {
    id: string
  }
}

export const dynamic = 'force-dynamic'

export default async function ProjectDetailsPage({
  params,
}: PageProps) {
  const db = getDb()
  const project = await db.query.projects.findFirst({
    where: (projects, { eq }) => eq(projects.id, params.id),
    with: {
      owner: true,
      campaigns: {
        with: {
          requirements: true,
          applications: {
            with: {
              creator: true,
              metrics: true,
            },
          },
        },
      },
    },
  })

  if (!project) {
    notFound()
  }

  return (
    <>
      <CampaignHero
        title={project.name}
        description={project.description || ""}
        heroImage={project.heroImage}
        socialLinks={{
          twitter: project.twitter ? `https://twitter.com/${project.twitter.replace('@', '')}` : undefined,
          discord: project.discord ? `https://discord.gg/${project.discord}` : undefined,
          website: project.website,
        }}
      />
      <DashboardShell>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{project.name}</h1>
            <p className="text-muted-foreground">
              {project.description}
            </p>
          </div>
          <CreateCampaignButton />
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {project.website && (
                    <a
                      href={project.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
                    >
                      <Globe className="h-4 w-4" />
                      Website
                    </a>
                  )}
                  {project.twitter && (
                    <a
                      href={`https://twitter.com/${project.twitter.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
                    >
                      <Twitter className="h-4 w-4" />
                      Twitter
                    </a>
                  )}
                  {project.discord && (
                    <a
                      href={`https://discord.gg/${project.discord}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
                    >
                      <MessageCircle className="h-4 w-4" />
                      Discord
                    </a>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <CardTitle>Campaigns</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {project.campaigns.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No campaigns yet</p>
                ) : (
                  <div className="grid gap-4">
                    {project.campaigns.map((campaign) => (
                      <Link
                        key={campaign.id}
                        href={`/project-owners/campaigns/${campaign.id}`}
                      >
                        <Card className="overflow-hidden hover:bg-muted/5 transition-colors">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="space-y-1">
                                <div className="flex items-center gap-3">
                                  <p className="font-medium">{campaign.name}</p>
                                  <Badge
                                    variant={
                                      campaign.status === 'active' ? 'default' :
                                      campaign.status === 'draft' ? 'secondary' :
                                      'destructive'
                                    }
                                    className={`capitalize ${
                                      campaign.status === 'active' ? 'bg-green-500/10 text-green-500' :
                                      campaign.status === 'draft' ? 'bg-yellow-500/10 text-yellow-500' :
                                      'bg-red-500/10 text-red-500'
                                    }`}
                                  >
                                    {campaign.status}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {campaign.description}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardShell>
    </>
  )
} 
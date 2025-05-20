'use client'

import * as React from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Building2, Globe, Twitter, MessageCircle } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { getBaseUrl } from "@/lib/utils"

interface Project {
  id: string
  name: string
  description: string
  website?: string
  twitter?: string
  discord?: string
  campaigns: Array<{
    id: string
    name: string
    status: 'draft' | 'active' | 'completed' | 'cancelled'
  }>
}

export function ProjectsList() {
  const { data: projects, isLoading } = useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: async () => {
      const response = await fetch('/api/projects')
      if (!response.ok) {
        throw new Error('Failed to fetch projects')
      }
      return response.json()
    },
  })

  if (isLoading) {
    return <div>Loading projects...</div>
  }

  if (!projects?.length) {
    return (
      <div className="text-center py-12">
        <Building2 className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">No projects yet</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Create your first project to get started
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <Link key={project.id} href={`/project-owners/projects/${project.id}`}>
          <Card className="overflow-hidden hover:bg-muted/5 transition-colors">
            <CardHeader>
              <CardTitle className="line-clamp-1">{project.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {project.description}
                </p>

                <div className="flex flex-wrap gap-2">
                  {project.website && (
                    <a
                      href={project.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
                      onClick={(e) => e.stopPropagation()}
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
                      onClick={(e) => e.stopPropagation()}
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
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MessageCircle className="h-4 w-4" />
                      Discord
                    </a>
                  )}
                </div>

                {project.campaigns.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {project.campaigns.map((campaign) => (
                      <Badge
                        key={campaign.id}
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
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
} 
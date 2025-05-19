'use client'

import * as React from 'react'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getDb } from "@/lib/db"
import { monetizationPolicies } from "@/db/schema"
import { formatNumber } from "@/lib/format"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { deleteMonetizationPolicyAction } from "@/actions/monetization-policies"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface MilestoneBonus {
  id: string
  impressionGoal: number
  bonusAmount: string
}

interface KolTierBonus {
  id: string
  tier: string
  bonusPercentage: string
}

interface MonetizationPolicy {
  id: string
  name: string
  description: string | null
  baseRateMultiplier: string
  milestoneBonus: MilestoneBonus[]
  kolTierBonus: KolTierBonus[]
  campaigns: {
    id: string
    name: string
  }[]
}

async function getPolicies() {
  const db = getDb()
  
  console.log('🔍 Fetching monetization policies')
  
  const policies = await db.query.monetizationPolicies.findMany({
    with: {
      campaigns: true,
      milestoneBonus: true,
      kolTierBonus: true,
    },
  })
  
  console.log('✅ Fetched policies:', policies.length)
  return policies
}

export function MonetizationPoliciesList() {
  const router = useRouter()
  const [policies, setPolicies] = useState<MonetizationPolicy[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [policyToDelete, setPolicyToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  React.useEffect(() => {
    async function fetchPolicies() {
      try {
        const response = await fetch('/api/monetization/policies')
        if (!response.ok) throw new Error('Failed to fetch policies')
        const data = await response.json()
        setPolicies(data)
      } catch (error) {
        console.error('Error fetching policies:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPolicies()
  }, [])

  const handleDelete = async () => {
    if (!policyToDelete) return

    setIsDeleting(true)
    try {
      const result = await deleteMonetizationPolicyAction(policyToDelete)
      if (result.success) {
        setPolicies(policies.filter(p => p.id !== policyToDelete))
        router.refresh()
      } else {
        alert('Failed to delete policy: ' + result.message)
      }
    } catch (error) {
      console.error('Error deleting policy:', error)
      alert('An error occurred while deleting the policy')
    } finally {
      setIsDeleting(false)
      setPolicyToDelete(null)
    }
  }

  if (isLoading) {
    return <div>Loading policies...</div>
  }

  return (
    <>
      <div className="grid gap-6">
        {policies.map((policy) => (
          <Card key={policy.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{policy.name}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {policy.description}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {policy.campaigns.length} Campaign{policy.campaigns.length !== 1 ? 's' : ''}
                  </Badge>
                  <Link href={`/project-owners/monetization-policies/${policy.id}/edit`}>
                    <Button variant="ghost" size="icon">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => setPolicyToDelete(policy.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                <div>
                  <h4 className="text-sm font-medium mb-2">Base Rate Multiplier</h4>
                  <p className="text-2xl font-bold">{parseFloat(policy.baseRateMultiplier).toFixed(1)}x</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">Milestone Bonuses</h4>
                  <div className="grid gap-2">
                    {policy.milestoneBonus.map((milestone) => (
                      <div key={milestone.impressionGoal} className="flex items-center justify-between p-2 rounded-lg border">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            {formatNumber(milestone.impressionGoal)} Impressions
                          </span>
                        </div>
                        <Badge variant="secondary">
                          +${parseFloat(milestone.bonusAmount).toFixed(2)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">KOL Tier Bonuses</h4>
                  <div className="grid gap-2">
                    {policy.kolTierBonus.map((bonus) => (
                      <div key={bonus.tier} className="flex items-center justify-between p-2 rounded-lg border">
                        <Badge
                          variant="outline"
                          className={
                            bonus.tier === 'GOLD' ? 'bg-yellow-500/10 text-yellow-500' :
                            bonus.tier === 'SILVER' ? 'bg-slate-500/10 text-slate-500' :
                            'bg-amber-800/10 text-amber-800'
                          }
                        >
                          {bonus.tier}
                        </Badge>
                        <Badge variant="secondary">
                          +{parseFloat(bonus.bonusPercentage).toFixed(1)}%
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                {policy.campaigns.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Linked Campaigns</h4>
                    <div className="grid gap-2">
                      {policy.campaigns.map((campaign) => (
                        <Link
                          key={campaign.id}
                          href={`/project-owners/campaigns/${campaign.id}`}
                          className="flex items-center justify-between p-2 rounded-lg border hover:bg-muted/5 transition-colors"
                        >
                          <span className="text-sm font-medium">{campaign.name}</span>
                          <Badge variant="secondary">View Campaign</Badge>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AlertDialog open={!!policyToDelete} onOpenChange={() => setPolicyToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the monetization policy
              and remove it from all linked campaigns.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600"
            >
              {isDeleting ? 'Deleting...' : 'Delete Policy'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
} 
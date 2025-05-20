'use client'

import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Pencil, Trash2, Send, Archive } from "lucide-react"
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface Campaign {
  id: string
  name: string
  description: string
  status: 'draft' | 'active' | 'completed' | 'cancelled'
  budget: string
  cpmValue: string
  startDate: Date
  endDate: Date
  projectId: string
  createdAt: Date
  updatedAt: Date
  project: {
    id: string
    name: string
  }
  requirements: {
    minFollowers: number
    requiredPlatforms: string
    contentType: string
    deliverables: string
  } | null
  monetizationPolicies: Array<{
    policy: {
      id: string
      name: string
      description: string | null
      baseRateMultiplier: string
      createdAt: Date
      updatedAt: Date
      milestoneBonus: Array<{
        id: string
        policyId: string
        impressionGoal: number
        bonusAmount: string
        createdAt: Date
        updatedAt: Date
      }>
      kolTierBonus: Array<{
        id: string
        policyId: string
        tier: 'BRONZE' | 'SILVER' | 'GOLD'
        bonusPercentage: string
        createdAt: Date
        updatedAt: Date
      }>
    }
  }>
  applications: Array<{
    id: string
    status: string
    proposal: string | null
    proposedAmount: string | null
    creator: {
      user: {
        username: string
        avatar: string
      }
      bio: string
      twitterHandle: string
      twitterFollowers: number
      tier: 'BRONZE' | 'SILVER' | 'GOLD'
    }
    metrics: Array<{
      id: string
      impressions: number
      clicks: number
      conversions: number
      engagement: string
      postUrl: string
      platform: string
    }>
  }>
}

interface CampaignActionsProps {
  campaign: Campaign
}

export function CampaignActions({ campaign }: CampaignActionsProps) {
  const router = useRouter()

  const handleEdit = () => {
    router.push(`/project-owners/campaigns/${campaign.id}/edit`)
  }

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/campaigns/${campaign.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete campaign')
      }

      toast.success("Campaign deleted successfully")
      router.push('/project-owners')
      router.refresh()
    } catch (error) {
      toast.error("Failed to delete the campaign. Please try again.")
    }
  }

  const handleStatusChange = async (newStatus: 'draft' | 'active' | 'completed' | 'cancelled') => {
    try {
      const response = await fetch(`/api/campaigns/${campaign.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error('Failed to update campaign status')
      }

      toast.success(`Campaign ${newStatus === 'active' ? 'published' : 'moved to draft'} successfully`)
      router.refresh()
    } catch (error) {
      toast.error("Failed to update campaign status. Please try again.")
    }
  }

  return (
    <div className="flex items-center gap-2">
      {campaign.status === 'draft' ? (
        <Button
          variant="default"
          size="sm"
          onClick={() => handleStatusChange('active')}
          className="flex items-center gap-2 bg-gradient-to-r from-[#C85627] to-[#FF7A42] text-white hover:shadow-[0_0_20px_rgba(200,86,39,0.3)]"
        >
          <Send className="h-4 w-4" />
          Publish Campaign
        </Button>
      ) : campaign.status === 'active' ? (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleStatusChange('draft')}
          className="flex items-center gap-2"
        >
          <Archive className="h-4 w-4" />
          Move to Draft
        </Button>
      ) : null}
      <Button
        variant="outline"
        size="sm"
        onClick={handleEdit}
        className="flex items-center gap-2"
      >
        <Pencil className="h-4 w-4" />
        Edit
      </Button>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="destructive"
            size="sm"
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the campaign
              "{campaign.name}" and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Delete Campaign
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
} 
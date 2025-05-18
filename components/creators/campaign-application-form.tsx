'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { GradientButton } from '@/components/ui/gradient-button'

interface Campaign {
  id: string
  name: string
  description: string
  budget: string
  requirements: {
    minFollowers: number
    requiredPlatforms: string[]
    contentType: string
    deliverables: string[]
  }
}

interface CampaignApplicationFormProps {
  campaign: Campaign
}

export function CampaignApplicationForm({ campaign }: CampaignApplicationFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const formData = new FormData(event.currentTarget)
    const proposedAmount = formData.get('proposedAmount')
    const message = formData.get('message')

    try {
      const res = await fetch(`/api/campaigns/${campaign.id}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          proposedAmount,
          message,
        }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to submit application')
      }

      router.push('/creators/applications')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <div className="rounded-lg border border-[#2A2625] p-6">
        <h3 className="mb-4 text-lg font-medium">Campaign Details</h3>
        <dl className="grid gap-4">
          <div>
            <dt className="text-sm text-muted-foreground">Budget</dt>
            <dd className="text-white">${campaign.budget}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">Required Platforms</dt>
            <dd className="flex flex-wrap gap-2">
              {campaign.requirements.requiredPlatforms.map((platform) => (
                <span
                  key={platform}
                  className="rounded-full bg-[#2A2625] px-2.5 py-0.5 text-xs font-medium text-white"
                >
                  {platform}
                </span>
              ))}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">Content Type</dt>
            <dd className="text-white">{campaign.requirements.contentType}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">Deliverables</dt>
            <dd className="text-white">
              <ul className="list-inside list-disc">
                {campaign.requirements.deliverables.map((deliverable) => (
                  <li key={deliverable}>{deliverable}</li>
                ))}
              </ul>
            </dd>
          </div>
        </dl>
      </div>

      <div className="rounded-lg border border-[#2A2625] p-6">
        <h3 className="mb-4 text-lg font-medium">Your Application</h3>
        <div className="space-y-4">
          <div>
            <label
              htmlFor="proposedAmount"
              className="block text-sm font-medium text-white"
            >
              Proposed Amount
            </label>
            <div className="mt-1">
              <input
                type="number"
                name="proposedAmount"
                id="proposedAmount"
                min="0"
                step="0.01"
                required
                className="block w-full rounded-md border-[#2A2625] bg-[#0A0A0A] px-4 py-2 text-white focus:border-[#FF7A42] focus:ring-[#FF7A42] sm:text-sm"
                placeholder="Enter your proposed amount"
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="message"
              className="block text-sm font-medium text-white"
            >
              Message
            </label>
            <div className="mt-1">
              <textarea
                name="message"
                id="message"
                rows={4}
                required
                className="block w-full rounded-md border-[#2A2625] bg-[#0A0A0A] px-4 py-2 text-white focus:border-[#FF7A42] focus:ring-[#FF7A42] sm:text-sm"
                placeholder="Explain why you're a good fit for this campaign"
              />
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-500/10 p-4">
          <p className="text-sm text-red-500">{error}</p>
        </div>
      )}

      <div className="flex justify-end">
        <GradientButton type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit Application'}
        </GradientButton>
      </div>
    </form>
  )
} 
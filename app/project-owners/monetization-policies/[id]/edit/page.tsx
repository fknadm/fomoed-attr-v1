import { getDb } from '@/lib/db';
import { monetizationPolicies, campaigns } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { CreateMonetizationPolicyForm } from '@/components/project-owners/monetization/create-policy-form';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditMonetizationPolicyPage({ params }: PageProps) {
  const { id } = await params;
  const db = getDb();
  
  // Get the policy with its bonuses
  const policy = await db.query.monetizationPolicies.findFirst({
    where: eq(monetizationPolicies.id, id),
    with: {
      milestoneBonus: true,
      kolTierBonus: true,
      campaigns: {
        with: {
          campaign: true,
        },
      },
    },
  });

  if (!policy) {
    notFound();
  }

  // Get all campaigns
  const allCampaigns = await db.query.campaigns.findMany({
    with: {
      monetizationPolicies: {
        with: {
          policy: true
        }
      },
    },
  });

  // Filter out campaigns that already have a different policy
  const availableCampaigns = allCampaigns.filter(c => 
    c.monetizationPolicies.length === 0 || 
    c.monetizationPolicies.some(p => p.policy.id === id)
  );

  // Get the IDs of campaigns that are currently linked to this policy
  const linkedCampaignIds = policy.campaigns.map(c => c.campaign.id);

  return (
    <div className="container max-w-4xl py-8">
      <h1 className="text-2xl font-semibold tracking-tight mb-8">Edit Monetization Policy</h1>
      <CreateMonetizationPolicyForm 
        campaigns={availableCampaigns}
        initialData={{
          name: policy.name,
          baseRateMultiplier: policy.baseRateMultiplier,
          milestoneBonuses: policy.milestoneBonus.map(b => ({
            impressionGoal: b.impressionGoal.toString(),
            bonusAmount: b.bonusAmount,
          })),
          kolTierBonuses: policy.kolTierBonus.map(b => ({
            tier: b.tier,
            bonusPercentage: b.bonusPercentage,
          })),
          campaignIds: linkedCampaignIds,
        }}
        policyId={id}
      />
    </div>
  );
} 
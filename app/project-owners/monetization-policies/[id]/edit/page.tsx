import { getDb } from '@/lib/db';
import { monetizationPolicies, campaigns } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { CreateMonetizationPolicyForm } from '@/components/project-owners/monetization/create-policy-form';
import { notFound } from 'next/navigation';

interface PageProps {
  params: {
    id: string;
  };
}

async function getPolicy(id: string) {
  const db = getDb();
  const policy = await db.query.monetizationPolicies.findFirst({
    where: eq(monetizationPolicies.id, id),
    with: {
      milestoneBonus: true,
      kolTierBonus: true,
    },
  });

  if (!policy) {
    notFound();
  }

  return policy;
}

async function getAvailableCampaigns() {
  const db = getDb();
  const campaignsList = await db.query.campaigns.findMany({
    columns: {
      id: true,
      name: true,
      status: true,
      monetizationPolicyId: true,
    },
  });

  return campaignsList;
}

export default async function EditMonetizationPolicyPage({ params: { id } }: PageProps) {
  const [policy, campaigns] = await Promise.all([
    getPolicy(id),
    getAvailableCampaigns(),
  ]);

  const initialData = {
    name: policy.name,
    description: policy.description || '',
    baseRateMultiplier: policy.baseRateMultiplier,
    milestoneBonuses: policy.milestoneBonus.map(mb => ({
      impressionGoal: mb.impressionGoal.toString(),
      bonusAmount: mb.bonusAmount,
    })),
    kolTierBonuses: policy.kolTierBonus.map(ktb => ({
      tier: ktb.tier,
      bonusPercentage: ktb.bonusPercentage,
    })),
    campaignIds: campaigns
      .filter(c => c.monetizationPolicyId === id)
      .map(c => c.id),
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Edit Monetization Policy</h1>
        <p className="text-muted-foreground">
          Update the policy details, bonuses, and campaign links.
        </p>
      </div>
      <CreateMonetizationPolicyForm
        campaigns={campaigns}
        initialData={initialData}
        policyId={id}
      />
    </div>
  );
} 
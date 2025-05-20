import { getDb } from '@/lib/db';
import { campaigns } from '@/db/schema';
import { CreateMonetizationPolicyForm } from '@/components/project-owners/monetization/create-policy-form';

export const dynamic = 'force-dynamic';

export default async function CreateMonetizationPolicyPage() {
  const db = getDb();
  
  // Get all campaigns that don't have a monetization policy
  const campaigns = await db.query.campaigns.findMany({
    with: {
      monetizationPolicies: {
        with: {
          policy: true
        }
      },
    },
  });

  // Filter out campaigns that already have a policy
  const availableCampaigns = campaigns.filter(c => c.monetizationPolicies.length === 0);

  return (
    <div className="container max-w-4xl py-8">
      <h1 className="text-2xl font-semibold tracking-tight mb-8">Create Monetization Policy</h1>
      <CreateMonetizationPolicyForm campaigns={availableCampaigns} />
    </div>
  );
} 
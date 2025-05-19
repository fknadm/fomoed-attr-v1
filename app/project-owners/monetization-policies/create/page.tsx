import { getDb } from '@/lib/db';
import { campaigns } from '@/db/schema';
import { CreateMonetizationPolicyForm } from '@/components/project-owners/monetization/create-policy-form';

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

export default async function CreateMonetizationPolicyPage() {
  const campaigns = await getAvailableCampaigns();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Create New Monetization Policy</h1>
        <p className="text-muted-foreground">
          Define a new policy with base rates, milestone bonuses, and KOL tier bonuses.
        </p>
      </div>
      <CreateMonetizationPolicyForm campaigns={campaigns} />
    </div>
  );
} 
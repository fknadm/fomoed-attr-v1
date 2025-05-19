'use server'

import { getDb } from '@/lib/db';
import {
  monetizationPolicies,
  milestoneBonus,
  kolTierBonus,
  campaigns,
} from '@/db/schema';
import { nanoid } from 'nanoid';
import { revalidatePath } from 'next/cache';
import { createPolicyServerSchema, type CreatePolicyInput } from '@/lib/schemas/monetization-policies';
import { eq } from 'drizzle-orm';

interface ActionResult {
  success: boolean;
  message?: string;
  policyId?: string;
}

export async function createMonetizationPolicyAction(
  data: CreatePolicyInput
): Promise<ActionResult> {
  console.log('Server Action: createMonetizationPolicyAction called with data:', data);

  const validation = createPolicyServerSchema.safeParse(data);
  if (!validation.success) {
    console.error('Server Action: Validation failed', validation.error.flatten());
    return {
      success: false,
      message: 'Server validation failed: ' + JSON.stringify(validation.error.flatten().fieldErrors, null, 2),
    };
  }

  const validatedData = validation.data;
  const db = getDb();
  const newPolicyId = nanoid();

  try {
    await db.transaction(async (tx) => {
      // Insert into monetizationPolicies
      await tx.insert(monetizationPolicies).values({
        id: newPolicyId,
        name: validatedData.name,
        description: validatedData.description || null,
        baseRateMultiplier: validatedData.baseRateMultiplier, // Schema expects text
        // createdAt and updatedAt have defaults in schema
      });
      console.log('Server Action: Inserted policy', newPolicyId);

      // Insert milestone bonuses
      if (validatedData.milestoneBonuses && validatedData.milestoneBonuses.length > 0) {
        const milestoneInserts = validatedData.milestoneBonuses.map((mb) => ({
          id: nanoid(),
          policyId: newPolicyId,
          impressionGoal: parseInt(mb.impressionGoal, 10), // Convert to number
          bonusAmount: mb.bonusAmount, // Schema expects text
        }));
        await tx.insert(milestoneBonus).values(milestoneInserts);
        console.log('Server Action: Inserted milestone bonuses', milestoneInserts.length);
      }

      // Insert KOL tier bonuses
      if (validatedData.kolTierBonuses && validatedData.kolTierBonuses.length > 0) {
        const kolTierInserts = validatedData.kolTierBonuses.map((ktb) => ({
          id: nanoid(),
          policyId: newPolicyId,
          tier: ktb.tier,
          bonusPercentage: ktb.bonusPercentage, // Schema expects text
        }));
        await tx.insert(kolTierBonus).values(kolTierInserts);
        console.log('Server Action: Inserted KOL tier bonuses', kolTierInserts.length);
      }

      // Link campaigns if provided
      if (validatedData.campaignIds && validatedData.campaignIds.length > 0) {
        for (const campaignId of validatedData.campaignIds) {
          await tx.update(campaigns)
            .set({ monetizationPolicyId: newPolicyId })
            .where(eq(campaigns.id, campaignId));
        }
        console.log('Server Action: Linked campaigns to policy', validatedData.campaignIds.length);
      }
    });

    // Revalidate the paths to update the lists
    revalidatePath('/project-owners/monetization-policies');
    revalidatePath('/project-owners/campaigns');
    console.log('Server Action: Policy creation successful, paths revalidated.');

    return {
      success: true,
      message: 'Monetization policy created successfully!',
      policyId: newPolicyId,
    };
  } catch (error) {
    console.error('Server Action: Error creating monetization policy:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'An unknown error occurred during policy creation.',
    };
  }
}

export async function updateMonetizationPolicyAction(
  policyId: string,
  data: CreatePolicyInput
): Promise<ActionResult> {
  console.log('Server Action: updateMonetizationPolicyAction called with data:', data);

  const validation = createPolicyServerSchema.safeParse(data);
  if (!validation.success) {
    console.error('Server Action: Validation failed', validation.error.flatten());
    return {
      success: false,
      message: 'Server validation failed: ' + JSON.stringify(validation.error.flatten().fieldErrors, null, 2),
    };
  }

  const validatedData = validation.data;
  const db = getDb();

  try {
    await db.transaction(async (tx) => {
      // Update monetization policy
      await tx.update(monetizationPolicies)
        .set({
          name: validatedData.name,
          description: validatedData.description || null,
          baseRateMultiplier: validatedData.baseRateMultiplier,
          updatedAt: new Date(),
        })
        .where(eq(monetizationPolicies.id, policyId));
      console.log('Server Action: Updated policy', policyId);

      // Delete existing milestone bonuses
      await tx.delete(milestoneBonus)
        .where(eq(milestoneBonus.policyId, policyId));

      // Insert new milestone bonuses
      if (validatedData.milestoneBonuses && validatedData.milestoneBonuses.length > 0) {
        const milestoneInserts = validatedData.milestoneBonuses.map((mb) => ({
          id: nanoid(),
          policyId,
          impressionGoal: parseInt(mb.impressionGoal, 10),
          bonusAmount: mb.bonusAmount,
        }));
        await tx.insert(milestoneBonus).values(milestoneInserts);
        console.log('Server Action: Updated milestone bonuses', milestoneInserts.length);
      }

      // Delete existing KOL tier bonuses
      await tx.delete(kolTierBonus)
        .where(eq(kolTierBonus.policyId, policyId));

      // Insert new KOL tier bonuses
      if (validatedData.kolTierBonuses && validatedData.kolTierBonuses.length > 0) {
        const kolTierInserts = validatedData.kolTierBonuses.map((ktb) => ({
          id: nanoid(),
          policyId,
          tier: ktb.tier,
          bonusPercentage: ktb.bonusPercentage,
        }));
        await tx.insert(kolTierBonus).values(kolTierInserts);
        console.log('Server Action: Updated KOL tier bonuses', kolTierInserts.length);
      }

      // Update campaign links
      if (validatedData.campaignIds) {
        // First, remove policy from all campaigns
        await tx.update(campaigns)
          .set({ monetizationPolicyId: null })
          .where(eq(campaigns.monetizationPolicyId, policyId));

        // Then, add policy to selected campaigns
        if (validatedData.campaignIds.length > 0) {
          for (const campaignId of validatedData.campaignIds) {
            await tx.update(campaigns)
              .set({ monetizationPolicyId: policyId })
              .where(eq(campaigns.id, campaignId));
          }
        }
        console.log('Server Action: Updated campaign links');
      }
    });

    // Revalidate the paths to update the lists
    revalidatePath('/project-owners/monetization-policies');
    revalidatePath('/project-owners/campaigns');
    console.log('Server Action: Policy update successful, paths revalidated.');

    return {
      success: true,
      message: 'Monetization policy updated successfully!',
      policyId,
    };
  } catch (error) {
    console.error('Server Action: Error updating monetization policy:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'An unknown error occurred during policy update.',
    };
  }
}

export async function deleteMonetizationPolicyAction(
  policyId: string
): Promise<ActionResult> {
  console.log('Server Action: deleteMonetizationPolicyAction called for policy:', policyId);
  const db = getDb();

  try {
    await db.transaction(async (tx) => {
      // First, remove policy from all campaigns
      await tx.update(campaigns)
        .set({ monetizationPolicyId: null })
        .where(eq(campaigns.monetizationPolicyId, policyId));

      // Delete milestone bonuses (cascade will handle this, but being explicit)
      await tx.delete(milestoneBonus)
        .where(eq(milestoneBonus.policyId, policyId));

      // Delete KOL tier bonuses (cascade will handle this, but being explicit)
      await tx.delete(kolTierBonus)
        .where(eq(kolTierBonus.policyId, policyId));

      // Finally, delete the policy itself
      await tx.delete(monetizationPolicies)
        .where(eq(monetizationPolicies.id, policyId));
    });

    // Revalidate the paths to update the lists
    revalidatePath('/project-owners/monetization-policies');
    revalidatePath('/project-owners/campaigns');
    console.log('Server Action: Policy deletion successful, paths revalidated.');

    return {
      success: true,
      message: 'Monetization policy deleted successfully!',
    };
  } catch (error) {
    console.error('Server Action: Error deleting monetization policy:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'An unknown error occurred during policy deletion.',
    };
  }
} 
'use server'

import { getDb } from '@/lib/db';
import {
  monetizationPolicies,
  milestoneBonus,
  kolTierBonus,
  campaigns,
  campaignMonetizationPolicies,
} from '@/db/schema';
import { nanoid } from 'nanoid';
import { revalidatePath } from 'next/cache';
import { createPolicyServerSchema, type CreatePolicyInput } from '@/lib/schemas/monetization-policies';
import { eq } from 'drizzle-orm';

interface ActionResult {
  success: boolean;
  message?: string;
  policyId?: string;
  data?: any;
  error?: string;
}

export async function createMonetizationPolicyAction(
  data: {
    name: string
    baseRateMultiplier: string
    milestoneBonuses: Array<{
      impressionGoal: string
      bonusAmount: string
    }>
    kolTierBonuses: Array<{
      tier: string
      bonusPercentage: string
    }>
    campaignIds?: string[]
  }
): Promise<ActionResult> {
  console.log('Server Action: createMonetizationPolicyAction called with data:', data);
  
  try {
    // Validate baseRateMultiplier
    if (!Number.isFinite(Number(data.baseRateMultiplier))) {
      throw new Error('Base rate multiplier must be a valid number');
    }
    // Validate milestoneBonuses
    for (const bonus of data.milestoneBonuses) {
      const impressionGoal = parseInt(bonus.impressionGoal);
      if (!Number.isFinite(impressionGoal)) {
        throw new Error('Impression goal must be a valid number');
      }
      if (!Number.isFinite(Number(bonus.bonusAmount))) {
        throw new Error('Bonus amount must be a valid number');
      }
    }
    // Validate kolTierBonuses
    for (const bonus of data.kolTierBonuses) {
      if (!Number.isFinite(Number(bonus.bonusPercentage))) {
        throw new Error('KOL tier bonus percentage must be a valid number');
      }
    }
    const db = getDb()
    const policyId = nanoid()
    
    // Start a transaction
    const result = await db.transaction(async (tx) => {
      // Create the policy
      const [policy] = await tx
        .insert(monetizationPolicies)
        .values({
          id: policyId,
          name: data.name,
          baseRateMultiplier: data.baseRateMultiplier,
        })
        .returning()

      // Create milestone bonuses
      if (data.milestoneBonuses.length > 0) {
        await tx
          .insert(milestoneBonus)
          .values(
            data.milestoneBonuses.map(bonus => ({
              id: nanoid(),
              policyId: policy.id,
              impressionGoal: parseInt(bonus.impressionGoal),
              bonusAmount: bonus.bonusAmount,
            }))
          )
      }

      // Create KOL tier bonuses
      if (data.kolTierBonuses.length > 0) {
        await tx
          .insert(kolTierBonus)
          .values(
            data.kolTierBonuses.map(bonus => ({
              id: nanoid(),
              policyId: policy.id,
              tier: bonus.tier as 'BRONZE' | 'SILVER' | 'GOLD',
              bonusPercentage: bonus.bonusPercentage,
            }))
          )
      }

      // Link campaigns if provided
      if (data.campaignIds?.length) {
        await tx
          .insert(campaignMonetizationPolicies)
          .values(
            data.campaignIds.map(campaignId => ({
              id: nanoid(),
              campaignId,
              policyId: policy.id,
            }))
          )
      }

      return policy
    })

    revalidatePath('/project-owners/monetization-policies')
    revalidatePath('/project-owners/campaigns')
    
    return { 
      success: true, 
      message: 'Monetization policy created successfully!',
      policyId: result.id,
      data: result 
    }
  } catch (error) {
    console.error('Error in createMonetizationPolicyAction:', error)
    return { 
      success: false, 
      message: error instanceof Error ? error.message : JSON.stringify(error) || 'Failed to create monetization policy' 
    }
  }
}

export async function updateMonetizationPolicyAction(
  policyId: string,
  data: {
    name: string
    baseRateMultiplier: string
    milestoneBonuses: Array<{
      impressionGoal: string
      bonusAmount: string
    }>
    kolTierBonuses: Array<{
      tier: string
      bonusPercentage: string
    }>
    campaignIds?: string[]
  }
): Promise<ActionResult> {
  console.log('Server Action: updateMonetizationPolicyAction called with data:', data);
  
  try {
    // Validate baseRateMultiplier
    if (!Number.isFinite(Number(data.baseRateMultiplier))) {
      throw new Error('Base rate multiplier must be a valid number');
    }
    // Validate milestoneBonuses
    for (const bonus of data.milestoneBonuses) {
      const impressionGoal = parseInt(bonus.impressionGoal);
      if (!Number.isFinite(impressionGoal)) {
        throw new Error('Impression goal must be a valid number');
      }
      if (!Number.isFinite(Number(bonus.bonusAmount))) {
        throw new Error('Bonus amount must be a valid number');
      }
    }
    // Validate kolTierBonuses
    for (const bonus of data.kolTierBonuses) {
      if (!Number.isFinite(Number(bonus.bonusPercentage))) {
        throw new Error('KOL tier bonus percentage must be a valid number');
      }
    }
    const db = getDb()
    
    // Start a transaction
    const result = await db.transaction(async (tx) => {
      // Update the policy
      const [policy] = await tx
        .update(monetizationPolicies)
        .set({
          name: data.name,
          baseRateMultiplier: data.baseRateMultiplier,
          updatedAt: new Date(),
        })
        .where(eq(monetizationPolicies.id, policyId))
        .returning()

      // Delete existing bonuses
      await tx
        .delete(milestoneBonus)
        .where(eq(milestoneBonus.policyId, policyId))
      
      await tx
        .delete(kolTierBonus)
        .where(eq(kolTierBonus.policyId, policyId))

      // Delete existing campaign links
      await tx
        .delete(campaignMonetizationPolicies)
        .where(eq(campaignMonetizationPolicies.policyId, policyId))

      // Create new milestone bonuses
      if (data.milestoneBonuses.length > 0) {
        await tx
          .insert(milestoneBonus)
          .values(
            data.milestoneBonuses.map(bonus => ({
              id: nanoid(),
              policyId: policy.id,
              impressionGoal: parseInt(bonus.impressionGoal),
              bonusAmount: bonus.bonusAmount,
            }))
          )
      }

      // Create new KOL tier bonuses
      if (data.kolTierBonuses.length > 0) {
        await tx
          .insert(kolTierBonus)
          .values(
            data.kolTierBonuses.map(bonus => ({
              id: nanoid(),
              policyId: policy.id,
              tier: bonus.tier as 'BRONZE' | 'SILVER' | 'GOLD',
              bonusPercentage: bonus.bonusPercentage,
            }))
          )
      }

      // Create new campaign links
      if (data.campaignIds?.length) {
        await tx
          .insert(campaignMonetizationPolicies)
          .values(
            data.campaignIds.map(campaignId => ({
              id: nanoid(),
              campaignId,
              policyId: policy.id,
            }))
          )
      }

      return policy
    })

    revalidatePath('/project-owners/monetization-policies')
    revalidatePath('/project-owners/campaigns')
    
    return { 
      success: true, 
      message: 'Monetization policy updated successfully!',
      policyId: result.id,
      data: result 
    }
  } catch (error) {
    console.error('Error in updateMonetizationPolicyAction:', error)
    return { 
      success: false, 
      message: error instanceof Error ? error.message : JSON.stringify(error) || 'Failed to update monetization policy' 
    }
  }
}

export async function deleteMonetizationPolicyAction(policyId: string): Promise<ActionResult> {
  console.log('Server Action: deleteMonetizationPolicyAction called for policy:', policyId);
  
  try {
    const db = getDb()
    
    // Start a transaction
    await db.transaction(async (tx) => {
      // Delete campaign links
      await tx
        .delete(campaignMonetizationPolicies)
        .where(eq(campaignMonetizationPolicies.policyId, policyId))

      // Delete milestone bonuses
      await tx
        .delete(milestoneBonus)
        .where(eq(milestoneBonus.policyId, policyId))

      // Delete KOL tier bonuses
      await tx
        .delete(kolTierBonus)
        .where(eq(kolTierBonus.policyId, policyId))

      // Delete the policy
      await tx
        .delete(monetizationPolicies)
        .where(eq(monetizationPolicies.id, policyId))
    })

    revalidatePath('/project-owners/monetization-policies')
    revalidatePath('/project-owners/campaigns')
    
    return { 
      success: true, 
      message: 'Monetization policy deleted successfully!' 
    }
  } catch (error) {
    console.error('Error in deleteMonetizationPolicyAction:', error)
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to delete monetization policy' 
    }
  }
} 
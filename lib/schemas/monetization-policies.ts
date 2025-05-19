import { z } from 'zod';

export const milestoneBonusServerSchema = z.object({
  impressionGoal: z.string().regex(/^\d+$/, "Impression goal must be a number"),
  bonusAmount: z.string().regex(/^\d*\.?\d+$/, "Bonus amount must be a number"),
});

export const kolTierBonusServerSchema = z.object({
  tier: z.enum(['BRONZE', 'SILVER', 'GOLD']),
  bonusPercentage: z.string().regex(/^\d*\.?\d+$/, "Bonus percentage must be a number"),
});

export const createPolicyServerSchema = z.object({
  name: z.string().min(1, 'Policy name is required'),
  description: z.string().optional(),
  baseRateMultiplier: z.string().regex(/^\d*\.?\d+$/, "Base rate multiplier must be a number"),
  milestoneBonuses: z.array(milestoneBonusServerSchema).optional(),
  kolTierBonuses: z.array(kolTierBonusServerSchema).optional(),
  campaignIds: z.array(z.string()).optional(),
});

export type CreatePolicyInput = z.infer<typeof createPolicyServerSchema>; 
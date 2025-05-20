import { relations } from "drizzle-orm"
import { sql } from "drizzle-orm"
import { 
  sqliteTable,
  text,
  integer,
  real,
  blob,
} from "drizzle-orm/sqlite-core"

// Users table
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  address: text('address').notNull().unique(),
  username: text('username'),
  avatar: text('avatar'),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
})

export const usersRelations = relations(users, ({ many }) => ({
  projects: many(projects),
  creatorProfile: many(creatorProfiles),
}))

// Projects table
export const projects = sqliteTable('projects', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  website: text('website'),
  twitter: text('twitter'),
  discord: text('discord'),
  heroImage: text('hero_image'),
  ownerId: text('owner_id').notNull().references(() => users.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
})

export const projectsRelations = relations(projects, ({ one, many }) => ({
  owner: one(users, {
    fields: [projects.ownerId],
    references: [users.id],
  }),
  campaigns: many(campaigns),
}))

// Monetization Policies table
export const monetizationPolicies = sqliteTable('monetization_policies', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  baseRateMultiplier: text('base_rate_multiplier').notNull().default('1.0'), // Using text for precise decimal handling
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
})

// Campaigns table
export const campaigns = sqliteTable('campaigns', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull().references(() => projects.id),
  name: text('name').notNull(),
  description: text('description').notNull(),
  heroImage: text('hero_image'),
  budget: text('budget').notNull(), // Using text for precise decimal handling
  cpmValue: text('cpm_value').notNull(), // Using text for precise decimal handling
  startDate: integer('start_date', { mode: 'timestamp' }).notNull(),
  endDate: integer('end_date', { mode: 'timestamp' }).notNull(),
  status: text('status', { enum: ['draft', 'active', 'completed', 'cancelled'] }).notNull().default('draft'),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
})

// Campaign Monetization Policy Junction table
export const campaignMonetizationPolicies = sqliteTable('campaign_monetization_policies', {
  id: text('id').primaryKey(),
  campaignId: text('campaign_id').notNull().references(() => campaigns.id),
  policyId: text('policy_id').notNull().references(() => monetizationPolicies.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
})

// Campaign Requirements table
export const campaignRequirements = sqliteTable('campaign_requirements', {
  id: text('id').primaryKey(),
  campaignId: text('campaign_id').notNull().references(() => campaigns.id),
  minFollowers: integer('min_followers'),
  requiredPlatforms: text('required_platforms'), // JSON string of required platforms
  contentType: text('content_type', { enum: ['video', 'post', 'review', 'other'] }).notNull(),
  deliverables: text('deliverables').notNull(), // JSON string of required deliverables
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
})

// Creator Profiles table
export const creatorProfiles = sqliteTable('creator_profiles', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  bio: text('bio'),
  twitterHandle: text('twitter_handle'),
  twitterFollowers: integer('twitter_followers'),
  discordHandle: text('discord_handle'),
  websiteUrl: text('website_url'),
  tier: text('tier', { enum: ['BRONZE', 'SILVER', 'GOLD'] }).notNull().default('BRONZE'),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
})

// Campaign Applications table
export const campaignApplications = sqliteTable('campaign_applications', {
  id: text('id').primaryKey(),
  campaignId: text('campaign_id').notNull().references(() => campaigns.id),
  creatorId: text('creator_id').notNull().references(() => creatorProfiles.id),
  status: text('status', { enum: ['pending', 'approved', 'rejected'] }).notNull().default('pending'),
  proposal: text('proposal'),
  proposedAmount: text('proposed_amount'), // Using text for precise decimal handling
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
})

// Campaign Metrics table
export const campaignMetrics = sqliteTable('campaign_metrics', {
  id: text('id').primaryKey(),
  campaignId: text('campaign_id').notNull().references(() => campaigns.id),
  applicationId: text('application_id').references(() => campaignApplications.id),
  impressions: integer('impressions').default(0),
  clicks: integer('clicks').default(0),
  conversions: integer('conversions').default(0),
  engagement: text('engagement').default('0'), // Using text for precise decimal handling
  postUrl: text('post_url'), // URL to the social media post
  platform: text('platform', { enum: ['twitter', 'instagram', 'youtube', 'tiktok', 'discord', 'other'] }), // Platform of the post
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
})

// Milestone Bonuses table
export const milestoneBonus = sqliteTable('milestone_bonus', {
  id: text('id').primaryKey(),
  policyId: text('policy_id').notNull().references(() => monetizationPolicies.id),
  impressionGoal: integer('impression_goal').notNull(),
  bonusAmount: text('bonus_amount').notNull(), // Using text for precise decimal handling
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
})

// KOL Tier Bonuses table
export const kolTierBonus = sqliteTable('kol_tier_bonus', {
  id: text('id').primaryKey(),
  policyId: text('policy_id').notNull().references(() => monetizationPolicies.id),
  tier: text('tier', { enum: ['BRONZE', 'SILVER', 'GOLD'] }).notNull(),
  bonusPercentage: text('bonus_percentage').notNull(), // Using text for precise decimal handling
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
})

// Relations
export const campaignsRelations = relations(campaigns, ({ one, many }) => ({
  project: one(projects, {
    fields: [campaigns.projectId],
    references: [projects.id],
  }),
  requirements: one(campaignRequirements),
  applications: many(campaignApplications),
  metrics: many(campaignMetrics),
  monetizationPolicies: many(campaignMonetizationPolicies),
}))

export const monetizationPoliciesRelations = relations(monetizationPolicies, ({ many }) => ({
  campaigns: many(campaignMonetizationPolicies),
  milestoneBonus: many(milestoneBonus),
  kolTierBonus: many(kolTierBonus),
}))

export const campaignMonetizationPoliciesRelations = relations(campaignMonetizationPolicies, ({ one }) => ({
  campaign: one(campaigns, {
    fields: [campaignMonetizationPolicies.campaignId],
    references: [campaigns.id],
  }),
  policy: one(monetizationPolicies, {
    fields: [campaignMonetizationPolicies.policyId],
    references: [monetizationPolicies.id],
  }),
}))

export const campaignRequirementsRelations = relations(campaignRequirements, ({ one }) => ({
  campaign: one(campaigns, {
    fields: [campaignRequirements.campaignId],
    references: [campaigns.id],
  }),
}))

export const creatorProfilesRelations = relations(creatorProfiles, ({ one, many }) => ({
  user: one(users, {
    fields: [creatorProfiles.userId],
    references: [users.id],
  }),
  applications: many(campaignApplications),
}))

export const campaignApplicationsRelations = relations(campaignApplications, ({ one, many }) => ({
  campaign: one(campaigns, {
    fields: [campaignApplications.campaignId],
    references: [campaigns.id],
  }),
  creator: one(creatorProfiles, {
    fields: [campaignApplications.creatorId],
    references: [creatorProfiles.id],
  }),
  metrics: many(campaignMetrics),
}))

export const campaignMetricsRelations = relations(campaignMetrics, ({ one }) => ({
  campaign: one(campaigns, {
    fields: [campaignMetrics.campaignId],
    references: [campaigns.id],
  }),
  application: one(campaignApplications, {
    fields: [campaignMetrics.applicationId],
    references: [campaignApplications.id],
  }),
}))

export const milestoneBonusRelations = relations(milestoneBonus, ({ one }) => ({
  policy: one(monetizationPolicies, {
    fields: [milestoneBonus.policyId],
    references: [monetizationPolicies.id],
  }),
}))

export const kolTierBonusRelations = relations(kolTierBonus, ({ one }) => ({
  policy: one(monetizationPolicies, {
    fields: [kolTierBonus.policyId],
    references: [monetizationPolicies.id],
  }),
}))
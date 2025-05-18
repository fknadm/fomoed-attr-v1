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

// Campaigns table
export const campaigns = sqliteTable('campaigns', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull().references(() => projects.id),
  name: text('name').notNull(),
  description: text('description').notNull(),
  budget: text('budget').notNull(), // Using text for precise decimal handling
  startDate: integer('start_date', { mode: 'timestamp' }).notNull(),
  endDate: integer('end_date', { mode: 'timestamp' }).notNull(),
  status: text('status', { enum: ['draft', 'active', 'completed', 'cancelled'] }).notNull().default('draft'),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
})

export const campaignsRelations = relations(campaigns, ({ one, many }) => ({
  project: one(projects, {
    fields: [campaigns.projectId],
    references: [projects.id],
  }),
  requirements: one(campaignRequirements),
  applications: many(campaignApplications),
  metrics: many(campaignMetrics),
}))

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

export const campaignRequirementsRelations = relations(campaignRequirements, ({ one }) => ({
  campaign: one(campaigns, {
    fields: [campaignRequirements.campaignId],
    references: [campaigns.id],
  }),
}))

// Creator Profiles table
export const creatorProfiles = sqliteTable('creator_profiles', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  bio: text('bio'),
  twitterHandle: text('twitter_handle'),
  twitterFollowers: integer('twitter_followers'),
  discordHandle: text('discord_handle'),
  websiteUrl: text('website_url'),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
})

export const creatorProfilesRelations = relations(creatorProfiles, ({ one, many }) => ({
  user: one(users, {
    fields: [creatorProfiles.userId],
    references: [users.id],
  }),
  applications: many(campaignApplications),
}))

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
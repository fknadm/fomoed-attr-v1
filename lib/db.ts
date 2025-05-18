import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { cache } from 'react';
import * as schema from '../db/schema';

// Database configuration
const DB_CONFIG = {
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
};

// Create a singleton client instance with error handling
const createDbClient = cache(() => {
  if (!DB_CONFIG.url) {
    throw new Error('TURSO_DATABASE_URL environment variable is not configured');
  }
  if (!DB_CONFIG.authToken) {
    throw new Error('TURSO_AUTH_TOKEN environment variable is not configured');
  }

  try {
    const client = createClient({
      url: DB_CONFIG.url,
      authToken: DB_CONFIG.authToken,
    });
    return drizzle(client, { schema });
  } catch (error) {
    console.error('Failed to create database client:', error);
    throw new Error(`Failed to initialize database connection: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
});

// Export the client creator function with error handling
export const getDb = () => {
  try {
    return createDbClient();
  } catch (error) {
    console.error('Error getting database client:', error);
    throw error;
  }
};

// Export schema types
export type Schema = typeof schema;
export type DbClient = ReturnType<typeof createDbClient>;

// Export query helpers with proper error handling
export const queryHelper = {
  // Projects with owner info
  getProjectWithOwner: async (db: DbClient, projectId: string) => {
    try {
      return await db.query.projects.findFirst({
        where: (projects, { eq }) => eq(projects.id, projectId),
        with: {
          owner: true,
        },
      });
    } catch (error) {
      console.error('Error fetching project with owner:', error);
      throw error;
    }
  },

  // Campaign with all related info
  getCampaignWithDetails: async (db: DbClient, campaignId: string) => {
    try {
      return await db.query.campaigns.findFirst({
        where: (campaigns, { eq }) => eq(campaigns.id, campaignId),
        with: {
          project: true,
          requirements: true,
          applications: {
            with: {
              creator: true,
              metrics: true,
            },
          },
        },
      });
    } catch (error) {
      console.error('Error fetching campaign with details:', error);
      throw error;
    }
  },

  // Creator profile with user info and applications
  getCreatorWithApplications: async (db: DbClient, creatorId: string) => {
    try {
      return await db.query.creatorProfiles.findFirst({
        where: (creators, { eq }) => eq(creators.id, creatorId),
        with: {
          user: true,
          applications: {
            with: {
              campaign: true,
              metrics: true,
            },
          },
        },
      });
    } catch (error) {
      console.error('Error fetching creator with applications:', error);
      throw error;
    }
  },

  // Active campaigns with requirements
  getActiveCampaigns: async (db: DbClient) => {
    try {
      return await db.query.campaigns.findMany({
        where: (campaigns, { eq }) => eq(campaigns.status, 'active'),
        with: {
          project: true,
          requirements: true,
        },
      });
    } catch (error) {
      console.error('Error fetching active campaigns:', error);
      throw error;
    }
  },
}; 
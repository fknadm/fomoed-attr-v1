import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from '../db/schema';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function main() {
  const dbUrl = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!dbUrl || !authToken) {
    console.error('❌ Missing database credentials in .env file');
    console.error('Required variables:');
    console.error('- TURSO_DATABASE_URL');
    console.error('- TURSO_AUTH_TOKEN');
    process.exit(1);
  }

  console.log('🔍 Testing database connection...');
  console.log('Database URL:', dbUrl);
  
  const client = createClient({
    url: dbUrl,
    authToken: authToken
  });

  console.log('✅ Client created');
  
  const db = drizzle(client, { schema });
  
  console.log('🔄 Running migrations...');
  
  try {
    // Check if monetization_policies table exists
    const result = await client.execute(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='monetization_policies'
    `);
    
    if (result.rows.length === 0) {
      console.log('Creating monetization tables...');
      
      // Add CPM value to campaigns table
      try {
        await client.execute(`ALTER TABLE campaigns ADD COLUMN cpm_value TEXT NOT NULL DEFAULT '0'`);
        console.log('Added cpm_value column');
      } catch (error: any) {
        if (!error.message.includes('duplicate column')) {
          throw error;
        }
        console.log('cpm_value column already exists');
      }

      // Create monetization policies table
      await client.execute(`
        CREATE TABLE monetization_policies (
          id TEXT PRIMARY KEY NOT NULL,
          name TEXT NOT NULL,
          description TEXT,
          base_rate_multiplier TEXT NOT NULL DEFAULT '1.0',
          created_at INTEGER NOT NULL DEFAULT (unixepoch()),
          updated_at INTEGER NOT NULL DEFAULT (unixepoch())
        )
      `);
      console.log('Created monetization_policies table');

      // Create milestone bonus table
      await client.execute(`
        CREATE TABLE milestone_bonus (
          id TEXT PRIMARY KEY NOT NULL,
          policy_id TEXT NOT NULL,
          impression_goal INTEGER NOT NULL,
          bonus_amount TEXT NOT NULL,
          created_at INTEGER NOT NULL DEFAULT (unixepoch()),
          updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
          FOREIGN KEY (policy_id) REFERENCES monetization_policies(id) ON DELETE CASCADE
        )
      `);
      console.log('Created milestone_bonus table');

      // Create KOL tier bonus table
      await client.execute(`
        CREATE TABLE kol_tier_bonus (
          id TEXT PRIMARY KEY NOT NULL,
          policy_id TEXT NOT NULL,
          tier TEXT NOT NULL CHECK (tier IN ('BRONZE', 'SILVER', 'GOLD')),
          bonus_percentage TEXT NOT NULL,
          created_at INTEGER NOT NULL DEFAULT (unixepoch()),
          updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
          FOREIGN KEY (policy_id) REFERENCES monetization_policies(id) ON DELETE CASCADE
        )
      `);
      console.log('Created kol_tier_bonus table');

      console.log('✅ Migrations completed successfully');
    } else {
      console.log('✅ Monetization tables already exist');
    }

    // Check if campaign_monetization_policies table exists
    const junctionResult = await client.execute(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='campaign_monetization_policies'
    `);
    
    if (junctionResult.rows.length === 0) {
      console.log('Creating campaign_monetization_policies table...');
      
      // Create campaign monetization policies junction table
      await client.execute(`
        CREATE TABLE campaign_monetization_policies (
          id TEXT PRIMARY KEY NOT NULL,
          campaign_id TEXT NOT NULL,
          policy_id TEXT NOT NULL,
          created_at INTEGER NOT NULL DEFAULT (unixepoch()),
          updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
          FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
          FOREIGN KEY (policy_id) REFERENCES monetization_policies(id) ON DELETE CASCADE
        )
      `);
      console.log('Created campaign_monetization_policies table');

      // Create indexes for better query performance
      await client.execute(`CREATE INDEX idx_campaign_monetization_policies_campaign_id ON campaign_monetization_policies(campaign_id);`);
      await client.execute(`CREATE INDEX idx_campaign_monetization_policies_policy_id ON campaign_monetization_policies(policy_id);`);
      console.log('Created indexes for campaign_monetization_policies table');

      // Remove the old monetization_policy_id column from campaigns table
      try {
        await client.execute(`ALTER TABLE campaigns DROP COLUMN monetization_policy_id`);
        console.log('Removed monetization_policy_id column from campaigns table');
      } catch (error: any) {
        if (!error.message.includes('no such column')) {
          throw error;
        }
        console.log('monetization_policy_id column does not exist');
      }

      console.log('✅ Campaign monetization policies migration completed successfully');
    } else {
      console.log('✅ Campaign monetization policies table already exists');
    }
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
  
  await client.close();
}

main().catch((error) => {
  console.error('❌ Script failed:', error);
  process.exit(1);
}); 
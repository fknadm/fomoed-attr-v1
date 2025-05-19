-- Add CPM value to campaigns table
ALTER TABLE campaigns ADD COLUMN cpm_value TEXT NOT NULL DEFAULT '0';
ALTER TABLE campaigns ADD COLUMN monetization_policy_id TEXT REFERENCES monetization_policies(id);

-- Create monetization policies table
CREATE TABLE monetization_policies (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  base_rate_multiplier TEXT NOT NULL DEFAULT '1.0',
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Create milestone bonus table
CREATE TABLE milestone_bonus (
  id TEXT PRIMARY KEY NOT NULL,
  policy_id TEXT NOT NULL,
  impression_goal INTEGER NOT NULL,
  bonus_amount TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
  FOREIGN KEY (policy_id) REFERENCES monetization_policies(id) ON DELETE CASCADE
);

-- Create KOL tier bonus table
CREATE TABLE kol_tier_bonus (
  id TEXT PRIMARY KEY NOT NULL,
  policy_id TEXT NOT NULL,
  tier TEXT NOT NULL CHECK (tier IN ('BRONZE', 'SILVER', 'GOLD')),
  bonus_percentage TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
  FOREIGN KEY (policy_id) REFERENCES monetization_policies(id) ON DELETE CASCADE
); 
-- Remove the old foreign key column
ALTER TABLE campaigns DROP COLUMN monetization_policy_id;

-- Create the junction table
CREATE TABLE campaign_monetization_policies (
  id TEXT PRIMARY KEY NOT NULL,
  campaign_id TEXT NOT NULL,
  policy_id TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
  FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
  FOREIGN KEY (policy_id) REFERENCES monetization_policies(id) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX idx_campaign_monetization_policies_campaign_id ON campaign_monetization_policies(campaign_id);
CREATE INDEX idx_campaign_monetization_policies_policy_id ON campaign_monetization_policies(policy_id); 
-- Create Users table
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('project_owner', 'creator')),
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Create Projects table
CREATE TABLE projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  owner_id TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
  FOREIGN KEY (owner_id) REFERENCES users(id)
);

-- Create Campaigns table
CREATE TABLE campaigns (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  budget REAL NOT NULL,
  cpm_value REAL NOT NULL,
  platforms TEXT NOT NULL,
  start_date INTEGER NOT NULL,
  end_date INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'cancelled')),
  project_id TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
  FOREIGN KEY (project_id) REFERENCES projects(id)
);

-- Create Campaign Requirements table
CREATE TABLE campaign_requirements (
  id TEXT PRIMARY KEY,
  campaign_id TEXT NOT NULL,
  min_followers INTEGER,
  verified_only INTEGER NOT NULL DEFAULT 0,
  tier TEXT NOT NULL CHECK (tier IN ('GOLD', 'SILVER', 'BRONZE')),
  deliverables TEXT NOT NULL,
  guidelines TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
  FOREIGN KEY (campaign_id) REFERENCES campaigns(id)
);

-- Create Creator Profiles table
CREATE TABLE creator_profiles (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  bio TEXT,
  twitter_handle TEXT,
  tiktok_handle TEXT,
  youtube_channel TEXT,
  follower_count INTEGER,
  verified INTEGER NOT NULL DEFAULT 0,
  tier TEXT NOT NULL DEFAULT 'BRONZE' CHECK (tier IN ('GOLD', 'SILVER', 'BRONZE')),
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create Campaign Applications table
CREATE TABLE campaign_applications (
  id TEXT PRIMARY KEY,
  campaign_id TEXT NOT NULL,
  creator_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  proposed_deliverables TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
  FOREIGN KEY (campaign_id) REFERENCES campaigns(id),
  FOREIGN KEY (creator_id) REFERENCES users(id)
);

-- Create Campaign Metrics table
CREATE TABLE campaign_metrics (
  id TEXT PRIMARY KEY,
  campaign_id TEXT NOT NULL,
  creator_id TEXT NOT NULL,
  platform TEXT NOT NULL,
  impressions INTEGER NOT NULL DEFAULT 0,
  engagements INTEGER NOT NULL DEFAULT 0,
  clicks INTEGER NOT NULL DEFAULT 0,
  conversions INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
  FOREIGN KEY (campaign_id) REFERENCES campaigns(id),
  FOREIGN KEY (creator_id) REFERENCES users(id)
); 
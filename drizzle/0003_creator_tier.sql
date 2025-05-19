-- Add tier field to creator profiles
ALTER TABLE creator_profiles ADD COLUMN tier TEXT NOT NULL DEFAULT 'BRONZE' CHECK (tier IN ('BRONZE', 'SILVER', 'GOLD')); 
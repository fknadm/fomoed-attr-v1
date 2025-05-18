-- Add indexes for foreign keys and commonly queried fields
CREATE INDEX idx_projects_owner_id ON projects(owner_id);
CREATE INDEX idx_campaigns_project_id ON campaigns(project_id);
CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_campaign_requirements_campaign_id ON campaign_requirements(campaign_id);
CREATE INDEX idx_creator_profiles_user_id ON creator_profiles(user_id);
CREATE INDEX idx_creator_profiles_twitter_followers ON creator_profiles(twitter_followers);
CREATE INDEX idx_campaign_applications_campaign_id ON campaign_applications(campaign_id);
CREATE INDEX idx_campaign_applications_creator_id ON campaign_applications(creator_id);
CREATE INDEX idx_campaign_applications_status ON campaign_applications(status);
CREATE INDEX idx_campaign_metrics_campaign_id ON campaign_metrics(campaign_id);
CREATE INDEX idx_campaign_metrics_application_id ON campaign_metrics(application_id); 
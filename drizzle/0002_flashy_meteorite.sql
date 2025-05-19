CREATE TABLE `kol_tier_bonus` (
	`id` text PRIMARY KEY NOT NULL,
	`policy_id` text NOT NULL,
	`tier` text NOT NULL,
	`bonus_percentage` text NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`policy_id`) REFERENCES `monetization_policies`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `milestone_bonus` (
	`id` text PRIMARY KEY NOT NULL,
	`policy_id` text NOT NULL,
	`impression_goal` integer NOT NULL,
	`bonus_amount` text NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`policy_id`) REFERENCES `monetization_policies`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `monetization_policies` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`base_rate_multiplier` text DEFAULT '1.0' NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
ALTER TABLE `campaign_metrics` ADD `platform` text;--> statement-breakpoint
ALTER TABLE `campaigns` ADD `cpm_value` text NOT NULL;--> statement-breakpoint
ALTER TABLE `campaigns` ADD `monetization_policy_id` text REFERENCES monetization_policies(id);--> statement-breakpoint
ALTER TABLE `creator_profiles` ADD `tier` text DEFAULT 'BRONZE' NOT NULL;
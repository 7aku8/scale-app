ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'owner';--> statement-breakpoint
ALTER TABLE "scales" ADD COLUMN "secret_token" text NOT NULL;
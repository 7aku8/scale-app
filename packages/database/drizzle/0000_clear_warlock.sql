CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" uuid NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"expires_at" timestamp,
	"password" text
);
--> statement-breakpoint
CREATE TABLE "environment_metrics" (
	"time" timestamp NOT NULL,
	"scale_id" uuid NOT NULL,
	"organization_id" integer NOT NULL,
	"temperature" double precision,
	"humidity" double precision
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"plan" text DEFAULT 'free',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "scales" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mac_address" text NOT NULL,
	"name" text,
	"organization_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "scales_mac_address_unique" UNIQUE("mac_address")
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"organization_id" integer,
	"role" text DEFAULT 'viewer',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "weight_measurements" (
	"time" timestamp NOT NULL,
	"scale_id" uuid NOT NULL,
	"organization_id" integer NOT NULL,
	"weight" double precision NOT NULL,
	"is_valid" boolean DEFAULT true
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "environment_metrics" ADD CONSTRAINT "environment_metrics_scale_id_scales_id_fk" FOREIGN KEY ("scale_id") REFERENCES "public"."scales"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scales" ADD CONSTRAINT "scales_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "weight_measurements" ADD CONSTRAINT "weight_measurements_scale_id_scales_id_fk" FOREIGN KEY ("scale_id") REFERENCES "public"."scales"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "env_time_idx" ON "environment_metrics" USING btree ("scale_id","time" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "weight_time_idx" ON "weight_measurements" USING btree ("scale_id","time" DESC NULLS LAST);
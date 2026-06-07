ALTER TABLE "transaction_modes" DROP CONSTRAINT "transaction_modes_user_name_unique";--> statement-breakpoint
DROP INDEX "transaction_modes_user_default_unique";--> statement-breakpoint
ALTER TABLE "organization_members" ADD COLUMN "is_default" boolean DEFAULT false NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "organization_members_user_default_unique" ON "organization_members" USING btree ("user_id") WHERE "organization_members"."is_default";--> statement-breakpoint
CREATE UNIQUE INDEX "transaction_modes_org_user_default_unique" ON "transaction_modes" USING btree ("org_id","user_id") WHERE "transaction_modes"."is_default";--> statement-breakpoint
ALTER TABLE "transaction_modes" ADD CONSTRAINT "transaction_modes_org_user_name_unique" UNIQUE("org_id","user_id","name");
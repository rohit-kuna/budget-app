CREATE TABLE "counter_party" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"org_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "counter_party_org_name_unique" UNIQUE("org_id","name")
);
--> statement-breakpoint
ALTER TABLE "expenses" ADD COLUMN "counter_party_id" integer;--> statement-breakpoint
ALTER TABLE "expenses" ADD COLUMN "transfer_status" varchar(10);--> statement-breakpoint
ALTER TABLE "counter_party" ADD CONSTRAINT "counter_party_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "counter_party_org_id_idx" ON "counter_party" USING btree ("org_id");--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_counter_party_id_counter_party_id_fk" FOREIGN KEY ("counter_party_id") REFERENCES "public"."counter_party"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "expenses_counter_party_id_idx" ON "expenses" USING btree ("counter_party_id");--> statement-breakpoint
CREATE INDEX "expenses_transfer_status_idx" ON "expenses" USING btree ("transfer_status");
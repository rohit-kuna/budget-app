CREATE TABLE "category_tags" (
	"id" serial PRIMARY KEY NOT NULL,
	"org_id" integer NOT NULL,
	"category_id" integer NOT NULL,
	"tag_id" integer NOT NULL,
	"usage_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "category_tags_category_tag_unique" UNIQUE("category_id","tag_id")
);
--> statement-breakpoint
ALTER TABLE "category_tags" ADD CONSTRAINT "category_tags_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "category_tags" ADD CONSTRAINT "category_tags_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "category_tags" ADD CONSTRAINT "category_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "category_tags_org_id_idx" ON "category_tags" USING btree ("org_id");--> statement-breakpoint
CREATE INDEX "category_tags_category_id_idx" ON "category_tags" USING btree ("category_id");
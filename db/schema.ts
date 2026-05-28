import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  index,
  serial,
  integer,
  smallint,
  numeric,
  text,
  date,
  unique,
  check,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import type { AppRole } from "@/app/lib/roles";

// organizations declared first; createdBy refs users via lazy arrow fn
export const organizations = pgTable("organizations", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  inviteUrl: varchar("invite_code", { length: 64 }).notNull().unique(),
  createdBy: uuid("created_by").notNull().references((): AnyPgColumn => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    clerkUserId: varchar("clerk_user_id", { length: 255 }).notNull().unique(),
    email: varchar("email", { length: 255 }).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    role: varchar("role", { length: 20 }).notNull().$type<AppRole>(),
    orgId: integer("org_id").references(() => organizations.id),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    clerkUserIdx: index("users_clerk_user_id_idx").on(table.clerkUserId),
  })
);

export const categories = pgTable(
  "categories",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 100 }).notNull(),
    orgId: integer("org_id").notNull().references(() => organizations.id),
    createdBy: uuid("created_by").notNull().references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    uniqueNamePerOrg: unique("categories_name_org_unique").on(table.name, table.orgId),
  })
);

export const expenses = pgTable(
  "expenses",
  {
    id: serial("id").primaryKey(),
    orgId: integer("org_id").notNull().references(() => organizations.id),
    createdBy: uuid("created_by").notNull().references(() => users.id),
    partyId: uuid("party_id").references(() => users.id),
    categoryId: integer("category_id").notNull().references(() => categories.id),
    amt: numeric("amt", { precision: 12, scale: 2 }).notNull(),
    type: varchar("type", { length: 10 }).notNull().$type<"expense" | "income">(),
    transactionMode: varchar("transaction_mode", { length: 10 }).notNull().$type<"net" | "cash">(),
    scope: varchar("scope", { length: 10 }).notNull().$type<"personal" | "fam">(),
    necessityScore: smallint("necessity_score"),
    note: text("note"),
    timestamp: timestamp("timestamp", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    necessityScoreCheck: check(
      "expenses_necessity_score_check",
      sql`${table.necessityScore} IS NULL OR (${table.necessityScore} >= 1 AND ${table.necessityScore} <= 5)`
    ),
  })
);

export const budget = pgTable(
  "budget",
  {
    id: serial("id").primaryKey(),
    orgId: integer("org_id").notNull().references(() => organizations.id),
    userId: uuid("user_id").notNull().references(() => users.id),
    categoryId: integer("category_id").notNull().references(() => categories.id),
    periodFrom: date("period_from").notNull(),
    periodTo: date("period_to").notNull(),
    allocationPct: smallint("allocation_pct").notNull(),
    createdBy: uuid("created_by").notNull().references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    uniqueUserCategoryPeriod: unique("budget_user_category_period_unique").on(
      table.userId,
      table.categoryId,
      table.periodFrom,
      table.periodTo
    ),
    allocationPctCheck: check(
      "budget_allocation_pct_check",
      sql`${table.allocationPct} >= 1 AND ${table.allocationPct} <= 100`
    ),
  })
);

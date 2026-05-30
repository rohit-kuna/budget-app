import { currentUser } from "@clerk/nextjs/server";
import { cache } from "react";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ROLES } from "@/app/lib/roles";

/**
 * Ensures the logged-in Clerk user exists in DB.
 * Safe to call multiple times.
 */
type ClerkUser = NonNullable<Awaited<ReturnType<typeof currentUser>>>;

export const syncUserWithDb = cache(async (clerkUser?: ClerkUser | null) => {
  const resolvedClerkUser = clerkUser ?? (await currentUser());
  const resolvedClerkUserId = resolvedClerkUser?.id;

  if (!resolvedClerkUser || !resolvedClerkUserId) return null;

  const email = resolvedClerkUser.emailAddresses[0]?.emailAddress;

  if (!email) {
    throw new Error("Clerk user has no email address");
  }

  const name =
    [resolvedClerkUser.firstName, resolvedClerkUser.lastName].filter(Boolean).join(" ") || email;

  // Insert once; no-op for returning users.
  await db
    .insert(users)
    .values({
      clerkUserId: resolvedClerkUserId,
      email,
      name,
      role: ROLES.USER,
    })
    .onConflictDoNothing({ target: users.clerkUserId });

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.clerkUserId, resolvedClerkUserId))
    .limit(1);

  if (!user) {
    throw new Error(
      "Unable to sync user to DB. Ensure migrations are applied (run `npm run drizzle-push`)."
    );
  }

  return user;
});

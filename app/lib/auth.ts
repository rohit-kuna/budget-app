import { currentUser } from "@clerk/nextjs/server";
import { cache } from "react";
import { redirect } from "next/navigation";
import { syncUserWithDb } from "@/app/lib/user-sync";
import { ROUTES } from "@/app/lib/constants";
import { ROLES } from "@/app/lib/roles";

/**
 * Returns the application user (DB user)
 */
export const getCurrentDbUser = cache(async () => {
  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  try {
    // Ensure user exists in DB
    return await syncUserWithDb(clerkUser);
  } catch {
    redirect(ROUTES.SERVICE_UNAVAILABLE);
  }
});

/**
 * Require authenticated user
 */
export async function requireUser() {
  const user = await getCurrentDbUser();
  if (!user) redirect(ROUTES.SIGN_IN);
  return user;
}

/**
 * Require admin role
 */
export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== ROLES.ADMIN) redirect(ROUTES.DASHBOARD);
  return user;
}

"use client";

import { AlertCircle, KeyRound, ShieldPlus } from "lucide-react";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createOrganizationFromOnboardingAction,
  joinOrganizationByInviteCodeAction,
} from "@/app/actions/auth-roles/onboarding.actions";
import { onboardingInitialState } from "@/app/actions/auth-roles/onboarding.types";

function SubmitButton({
  children,
  pending,
}: {
  children: string;
  pending: boolean;
}) {
  return (
    <Button type="submit" className="w-full sm:w-auto" disabled={pending}>
      {children}
    </Button>
  );
}

function ActionError({ message }: { message: string | null }) {
  if (!message) return null;

  return (
    <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
      <AlertCircle className="mt-0.5 size-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

export function OnboardingDashboard() {
  const [joinState, joinAction, joinPending] = useActionState(
    joinOrganizationByInviteCodeAction,
    onboardingInitialState
  );
  const [createState, createAction, createPending] = useActionState(
    createOrganizationFromOnboardingAction,
    onboardingInitialState
  );

  return (
    <section className="grid gap-6 lg:grid-cols-2">
      <Card className="py-2">
        <CardHeader className="px-8 pt-8">
          <div className="mb-4 flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
            <KeyRound className="size-5" />
          </div>
          <CardTitle className="text-2xl tracking-tight">Join an organization</CardTitle>
          <CardDescription>
            Enter an invite code to join an existing team and open the shared dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <form action={joinAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="inviteCode">Invite code</Label>
              <Input
                id="inviteCode"
                name="inviteCode"
                placeholder="Paste invite code here"
                autoComplete="off"
                required
              />
            </div>
            <ActionError message={joinState.error} />
            <SubmitButton pending={joinPending}>
              {joinPending ? "Joining..." : "Join organization"}
            </SubmitButton>
          </form>
        </CardContent>
      </Card>

      <Card className="py-2">
        <CardHeader className="px-8 pt-8">
          <div className="mb-4 flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
            <ShieldPlus className="size-5" />
          </div>
          <CardTitle className="text-2xl tracking-tight">
            Create a new organization
          </CardTitle>
          <CardDescription>
            Start from scratch, become the admin, and manage members from the admin dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 px-8 pb-8">
          <form action={createAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Organization name</Label>
              <Input
                id="name"
                name="name"
                placeholder="Acme Finance"
                autoComplete="organization"
                required
              />
            </div>
            <ActionError message={createState.error} />
            <SubmitButton pending={createPending}>
              {createPending ? "Creating..." : "Create organization"}
            </SubmitButton>
          </form>
          <div className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
            After creation, you’ll land in the admin dashboard where you can manage members,
            regenerate invite codes, and share the invite link.
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

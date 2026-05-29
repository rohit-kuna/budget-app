export function getOrganizationInviteLink(inviteCode: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (!appUrl) {
    return `/join/${inviteCode}`;
  }

  return new URL(`/join/${inviteCode}`, appUrl).toString();
}

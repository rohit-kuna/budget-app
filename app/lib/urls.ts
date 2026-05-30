import { headers } from "next/headers";

async function getBaseUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();

  if (configuredUrl && !configuredUrl.includes("localhost")) {
    return configuredUrl;
  }

  const requestHeaders = await headers();
  const forwardedHost = requestHeaders.get("x-forwarded-host");
  const host = forwardedHost ?? requestHeaders.get("host");

  if (host) {
    const protocol = requestHeaders.get("x-forwarded-proto") ?? "https";
    return `${protocol}://${host}`;
  }

  const vercelUrl = process.env.VERCEL_URL?.trim();
  if (vercelUrl) {
    return `https://${vercelUrl}`;
  }

  return configuredUrl ?? "http://localhost:3000";
}

export async function getOrganizationInviteLink(inviteCode: string) {
  return new URL(`/join/${inviteCode}`, await getBaseUrl()).toString();
}

import { randomUUID } from "crypto";

export function buildInviteCode() {
  return randomUUID();
}

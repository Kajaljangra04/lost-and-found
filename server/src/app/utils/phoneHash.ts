import { createHmac } from "crypto";

export function hashPhone(value?: string | null): string {
  const normalized = (value || "").replace(/\D/g, "");
  if (!normalized) return "";
  const secret = process.env.PHONE_MATCH_SECRET || process.env.JWT_SECRETS;
  if (!secret) throw new Error("Set PHONE_MATCH_SECRET (or JWT_SECRETS) before storing contact numbers.");
  return createHmac("sha256", secret).update(normalized).digest("hex");
}

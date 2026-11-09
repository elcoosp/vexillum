/**
 * Subscription tier definitions — mirrors crates/auth `Tier`.
 * Used by the pricing page, dashboard quota meters and honest UI gating.
 *
 * Two plans, no seats, no enterprise theater: Free covers every public
 * badge (keyless), Pro is one flat $8/mo that unlocks everything the
 * renderer can do — animated formats, uploads, all themes, higher limits.
 */
import type { BadgeUrlOptions } from "@vexillum/sdk";

export type Plan = "free" | "pro";
export type Format = NonNullable<BadgeUrlOptions["format"]>;

export interface PlanDef {
  id: Plan;
  name: string;
  priceUsd: number;
  /** billed monthly; 0 = free forever */
  priceNote: string;
  tagline: string;
  dailyQuota: number;
  rpm: number;
  cacheFloorSecs: number;
  formats: Format[];
  iconUploads: boolean;
  allThemes: boolean;
  originAllowlist: boolean;
  support: string;
}

export const FORMATS: Format[] = ["svg", "png", "jpg", "webp", "gif", "apng"];

export const PLANS: Record<Plan, PlanDef> = {
  free: {
    id: "free",
    name: "Free",
    priceUsd: 0,
    priceNote: "free forever",
    tagline: "For READMEs, docs and side projects",
    dailyQuota: 5_000,
    rpm: 60,
    cacheFloorSecs: 3600,
    formats: ["svg", "png", "jpg"],
    iconUploads: false,
    allThemes: true,
    originAllowlist: false,
    support: "Community",
  },
  pro: {
    id: "pro",
    name: "Pro",
    priceUsd: 8,
    priceNote: "per month, flat",
    tagline: "For apps that need metering, animation and control",
    dailyQuota: 100_000,
    rpm: 600,
    cacheFloorSecs: 60,
    formats: ["svg", "png", "jpg", "webp", "gif", "apng"],
    iconUploads: true,
    allThemes: true,
    originAllowlist: true,
    support: "Email, next business day",
  },
};

export const PLAN_ORDER: Plan[] = ["free", "pro"];

export function planAllowsFormat(plan: Plan, format: Format): boolean {
  return PLANS[plan].formats.includes(format);
}

export function formatPrice(usd: number): string {
  return usd === 0 ? "$0" : `$${usd}`;
}

export function formatCount(n: number): string {
  return new Intl.NumberFormat("en-US", { notation: n >= 10_000 ? "compact" : "standard", maximumFractionDigits: 1 }).format(n);
}

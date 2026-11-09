import type { ReactNode } from "react";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Plan } from "@/lib/plans";

/**
 * Honest gating: the locked feature stays visible (disabled), with the
 * minimum plan that unlocks it and an upgrade CTA that opens billing.
 */
export function LockedPanel({
  title,
  description,
  requiredPlan,
  onUpgrade,
  children,
  className,
  compact,
}: {
  title: string;
  description: string;
  requiredPlan: Extract<Plan, "pro">;
  onUpgrade: () => void;
  children?: ReactNode;
  className?: string;
  compact?: boolean;
}) {
  return (
    <section
      aria-label={`${title} (locked — requires ${requiredPlan})`}
      className={cn("relative overflow-hidden rounded-lg border border-border bg-muted/30", className)}
    >
      <div aria-hidden className={cn("pointer-events-none select-none opacity-40", compact && "blur-[1px]")}>
        {children}
      </div>
      <div className={cn("absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/60 p-4 text-center", compact && "p-2")}>
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Lock className="h-3.5 w-3.5" aria-hidden />
        </span>
        <p className="text-xs font-semibold">{title}</p>
        <p className="max-w-xs text-[11px] text-muted-foreground">{description}</p>
        <Button size="sm" onClick={onUpgrade} data-testid="upgrade-cta">
          Upgrade to Pro — $8/mo
        </Button>
      </div>
    </section>
  );
}

export function PlanPill({ plan, dataTestId }: { plan: Plan | "visitor"; dataTestId?: string }) {
  const tone =
    plan === "pro"
      ? "border-blue-300 bg-blue-50 text-blue-700"
      : "border-border bg-muted text-muted-foreground";
  return (
    <span
      className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider", tone)}
      data-testid={dataTestId}
    >
      {plan}
    </span>
  );
}

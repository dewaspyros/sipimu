import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export type StatTone = "primary" | "success" | "warning" | "destructive";

const TONE_STYLES: Record<StatTone, { chip: string; value: string }> = {
  primary: { chip: "bg-primary/10 text-primary", value: "text-foreground" },
  success: { chip: "bg-success/10 text-success", value: "text-success" },
  warning: { chip: "bg-warning/10 text-warning", value: "text-warning" },
  destructive: { chip: "bg-destructive/10 text-destructive", value: "text-destructive" },
};

export interface StatCardProps {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  icon: LucideIcon;
  tone?: StatTone;
  isLoading?: boolean;
  className?: string;
}

/** Kartu ringkasan (KPI) berikon dengan tinggi stabil saat loading. */
export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "primary",
  isLoading = false,
  className,
}: StatCardProps) {
  const styles = TONE_STYLES[tone];

  return (
    <Card
      className={cn(
        "medical-card relative overflow-hidden p-5 medical-transition hover:shadow-elevated",
        className
      )}
    >
      <span
        aria-hidden="true"
        className={cn("absolute inset-x-0 top-0 h-1", {
          "bg-primary": tone === "primary",
          "bg-success": tone === "success",
          "bg-warning": tone === "warning",
          "bg-destructive": tone === "destructive",
        })}
      />
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 space-y-1.5">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          {isLoading ? (
            <Skeleton className="h-8 w-24" />
          ) : (
            <p className={cn("font-heading text-2xl font-bold leading-none sm:text-3xl", styles.value)}>
              {value}
            </p>
          )}
          {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        </div>
        <span className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl", styles.chip)}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
      </div>
    </Card>
  );
}

import { Skeleton } from "./skeleton";

interface SummaryCardProps {
  label: string;
  /** Formatted value, e.g. from formatCurrencyString. */
  value: string;
  icon: React.ReactNode;
  accent: string;
  className?: string;
  /** Small note under the value. */
  hint?: string;
}

export function SummaryCard({
  label,
  value,
  icon,
  accent,
  className,
  hint,
}: SummaryCardProps) {
  return (
    <article
      className={`rounded-2xl border border-foreground/10 bg-background p-5 ${className}`}
    >
      <div className="flex gap-2 items-center mb-6">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl bg-background ${accent}`}
        >
          {icon}
        </div>
        <p className={`text-sm ${accent}`}>{label}</p>
      </div>
      <p className={`mt-1 text-2xl font-semibold text-right ${accent}`}>
        {value}
      </p>
      {hint ? (
        <p className="mt-1 text-right text-xs text-foreground/60">{hint}</p>
      ) : null}
    </article>
  );
}

export function SummaryCardSkeleton() {
  return (
    <article className="rounded-2xl border border-foreground/10 bg-background p-5">
      <div className="flex gap-2 items-center mb-6">
        <Skeleton className="h-10 w-10 rounded-xl" />
        <Skeleton className="h-4 w-20 rounded" />
      </div>
      <div className="flex justify-end">
        <Skeleton className="h-6 w-24 rounded" />
      </div>
    </article>
  );
}

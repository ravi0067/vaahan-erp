import { cn } from "@/lib/utils";

function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse rounded-md bg-muted", className)} />
  );
}

export function TableSkeleton({ rows = 5, cols = 6 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-3">
      <div className="flex gap-4">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          {Array.from({ length: cols }).map((_, j) => (
            <Skeleton key={j} className="h-8 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="rounded-xl border bg-card p-6 space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4 rounded" />
      </div>
      <Skeleton className="h-8 w-20" />
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border bg-card p-6">
          <Skeleton className="h-4 w-32 mb-4" />
          <Skeleton className="h-48 w-full" />
        </div>
        <div className="rounded-xl border bg-card p-6">
          <Skeleton className="h-4 w-32 mb-4" />
          <TableSkeleton rows={4} cols={3} />
        </div>
      </div>
    </div>
  );
}

export { Skeleton };

import type { ReactNode } from "react";

export function SkeletonBlock({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={[
        "animate-skeleton rounded-lg bg-white/[0.11]",
        className,
      ].join(" ")}
    />
  );
}

export function SkeletonChip({ className = "" }: { className?: string }) {
  return <SkeletonBlock className={`h-7 w-20 rounded-full ${className}`} />;
}

export function SkeletonButton({ className = "" }: { className?: string }) {
  return <SkeletonBlock className={`h-[42px] w-32 ${className}`} />;
}

export function PanelSkeleton({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <article
      className={[
        "min-w-0 rounded-lg border border-white/15 bg-white/[0.055] p-[22px] shadow-[0_22px_54px_rgba(0,0,0,0.26)] backdrop-blur-xl",
        className,
      ].join(" ")}
    >
      {children}
    </article>
  );
}

export function CardSkeleton({ tall = false }: { tall?: boolean }) {
  return (
    <div
      className={[
        "grid gap-4 rounded-lg border border-white/15 bg-white/[0.055] p-[18px]",
        tall ? "min-h-[240px]" : "min-h-[210px]",
      ].join(" ")}
    >
      <div className="flex items-center justify-between gap-3">
        <SkeletonChip className="w-16" />
        <SkeletonBlock className="h-4 w-14" />
      </div>
      <SkeletonBlock className="h-7 w-4/5" />
      <div className="grid gap-2">
        <SkeletonBlock className="h-4 w-full" />
        <SkeletonBlock className="h-4 w-3/4" />
      </div>
      <div className="mt-auto flex gap-2">
        <SkeletonChip className="w-20" />
        <SkeletonChip className="w-16" />
      </div>
    </div>
  );
}

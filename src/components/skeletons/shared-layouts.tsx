import {
  CardSkeleton,
  PanelSkeleton,
  SkeletonBlock,
  SkeletonButton,
  SkeletonChip,
} from "@/components/skeletons/primitives";

export function HeroSkeleton({
  action = true,
  back = false,
}: {
  action?: boolean;
  back?: boolean;
}) {
  return (
    <section className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-6 border-b border-white/15 pb-7 max-md:grid-cols-1">
      <div>
        {back ? <SkeletonBlock className="mb-3 h-4 w-20" /> : null}
        <SkeletonChip className="mb-3" />
        <SkeletonBlock className="h-11 w-full max-w-[460px]" />
        <SkeletonBlock className="mt-3 h-5 w-full max-w-[680px]" />
      </div>
      {action ? <SkeletonButton /> : null}
    </section>
  );
}

export function SearchPanelSkeleton() {
  return (
    <PanelSkeleton>
      <div className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-end gap-3 max-md:grid-cols-1">
        <div className="grid gap-2">
          <SkeletonBlock className="h-5 w-40" />
          <SkeletonBlock className="h-[52px] w-full" />
        </div>
        <SkeletonBlock className="h-[52px] w-28 max-md:w-full" />
        <SkeletonBlock className="h-[52px] w-28 max-md:w-full" />
      </div>
    </PanelSkeleton>
  );
}

export function ResultPanelSkeleton({ cards = 6 }: { cards?: number }) {
  return (
    <PanelSkeleton>
      <div className="mb-5 flex items-center justify-between gap-3 max-md:flex-col max-md:items-start">
        <div className="grid gap-2">
          <SkeletonBlock className="h-8 w-56" />
          <SkeletonBlock className="h-4 w-44" />
        </div>
        <div className="flex gap-2">
          <SkeletonButton className="h-10 w-20" />
          <SkeletonButton className="h-10 w-20" />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: cards }, (_, index) => (
          <CardSkeleton key={index} />
        ))}
      </div>
    </PanelSkeleton>
  );
}

export function HorizontalCardsSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-flow-col auto-cols-[minmax(260px,320px)] gap-3.5 overflow-hidden pb-2">
      {Array.from({ length: count }, (_, index) => (
        <CardSkeleton key={index} />
      ))}
    </div>
  );
}

export function SummaryCardsSkeleton() {
  return (
    <section className="grid gap-4 md:grid-cols-3">
      {Array.from({ length: 3 }, (_, index) => (
        <PanelSkeleton className="min-h-[118px]" key={index}>
          <SkeletonBlock className="h-4 w-24" />
          <SkeletonBlock className="mt-3 h-8 w-20" />
        </PanelSkeleton>
      ))}
    </section>
  );
}

export function GraphSkeleton() {
  return (
    <div className="relative min-h-[460px] overflow-hidden rounded-lg border border-white/15 bg-[radial-gradient(circle_at_28%_24%,rgba(225,0,255,.18),transparent_22%),radial-gradient(circle_at_72%_76%,rgba(255,0,64,.16),transparent_24%),rgba(255,255,255,.04)]">
      <SkeletonBlock className="absolute top-[22%] left-[18%] h-20 w-32" />
      <SkeletonBlock className="absolute top-[38%] left-[48%] h-20 w-32" />
      <SkeletonBlock className="absolute top-[62%] left-[30%] h-20 w-32" />
      <SkeletonBlock className="absolute top-[58%] left-[70%] h-20 w-32" />
    </div>
  );
}

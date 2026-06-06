import { PageShell } from "@/components/page-shell";
import {
  CardSkeleton,
  PanelSkeleton,
  SkeletonBlock,
  SkeletonButton,
  SkeletonChip,
} from "@/components/skeletons/primitives";
import {
  GraphSkeleton,
  HeroSkeleton,
  HorizontalCardsSkeleton,
} from "@/components/skeletons/shared-layouts";
import type { ActiveKey } from "@/components/skeletons/types";

export function DetailPageSkeleton({
  activeKey,
  cover = false,
  relation = false,
}: {
  activeKey: ActiveKey;
  cover?: boolean;
  relation?: boolean;
}) {
  return (
    <PageShell activeKey={activeKey}>
      <HeroSkeleton back />
      {cover ? (
        <PanelSkeleton className="aspect-video p-0 sm:aspect-[8/3]">
          <SkeletonBlock className="h-full w-full" />
        </PanelSkeleton>
      ) : null}
      <PanelSkeleton>
        <div className="mb-5 flex justify-between gap-3">
          <SkeletonBlock className="h-8 w-44" />
          <div className="flex gap-2">
            <SkeletonChip />
            <SkeletonChip className="w-16" />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <CardSkeleton />
          <CardSkeleton />
        </div>
        <div className="mt-5 grid gap-2 rounded-lg border border-white/10 bg-black/30 p-[18px]">
          <SkeletonBlock className="h-5 w-full" />
          <SkeletonBlock className="h-5 w-11/12" />
          <SkeletonBlock className="h-5 w-4/5" />
        </div>
      </PanelSkeleton>
      <PanelSkeleton>
        <div className="mb-5 flex items-center justify-between">
          <SkeletonBlock className="h-8 w-36" />
          <SkeletonButton className="h-9 w-24" />
        </div>
        {relation ? <GraphSkeleton /> : <HorizontalCardsSkeleton />}
      </PanelSkeleton>
      <PanelSkeleton>
        <div className="mb-5 flex items-center justify-between">
          <SkeletonBlock className="h-8 w-36" />
          <SkeletonButton className="h-9 w-24" />
        </div>
        <HorizontalCardsSkeleton />
      </PanelSkeleton>
    </PageShell>
  );
}

export function AffiliationDetailSkeleton() {
  return (
    <PageShell activeKey="characters">
      <HeroSkeleton back />
      <PanelSkeleton>
        <SkeletonBlock className="mb-5 h-8 w-44" />
        <div className="grid grid-cols-[minmax(220px,0.7fr)_minmax(0,1.3fr)] gap-4 max-md:grid-cols-1">
          <div className="grid gap-4">
            <CardSkeleton tall />
            <CardSkeleton />
          </div>
          <CardSkeleton tall />
        </div>
      </PanelSkeleton>
      <PanelSkeleton>
        <SkeletonBlock className="mb-5 h-8 w-36" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </PanelSkeleton>
    </PageShell>
  );
}

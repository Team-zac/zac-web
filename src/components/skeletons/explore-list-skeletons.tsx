import { PageShell } from "@/components/page-shell";
import { PanelSkeleton, SkeletonBlock, SkeletonButton } from "@/components/skeletons/primitives";
import {
  HeroSkeleton,
  HorizontalCardsSkeleton,
  ResultPanelSkeleton,
  SearchPanelSkeleton,
} from "@/components/skeletons/shared-layouts";
import type { ActiveKey } from "@/components/skeletons/types";

export function ExplorePageSkeleton({ activeKey }: { activeKey: ActiveKey }) {
  return (
    <PageShell activeKey={activeKey}>
      <HeroSkeleton />
      <SearchPanelSkeleton />
      <ResultPanelSkeleton />
    </PageShell>
  );
}

export function ManagementListSkeleton({ activeKey }: { activeKey: ActiveKey }) {
  return (
    <PageShell activeKey={activeKey}>
      <HeroSkeleton />
      <PanelSkeleton>
        <div className="mb-4 flex items-center justify-between gap-4">
          <SkeletonBlock className="h-8 w-36" />
          <div className="flex gap-2">
            <SkeletonButton className="h-9 w-20" />
            <SkeletonButton className="h-9 w-20" />
          </div>
        </div>
        <HorizontalCardsSkeleton />
      </PanelSkeleton>
    </PageShell>
  );
}

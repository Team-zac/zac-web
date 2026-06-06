import { PageShell } from "@/components/page-shell";
import { PanelSkeleton, SkeletonBlock, SkeletonButton } from "@/components/skeletons/primitives";
import {
  HeroSkeleton,
  HorizontalCardsSkeleton,
  SummaryCardsSkeleton,
} from "@/components/skeletons/shared-layouts";

export function WorkspaceSkeleton() {
  return (
    <PageShell activeKey="workspace">
      <HeroSkeleton action={false} />
      <SummaryCardsSkeleton />
      {Array.from({ length: 4 }, (_, index) => (
        <PanelSkeleton key={index}>
          <div className="mb-4 flex items-center justify-between gap-4">
            <SkeletonBlock className="h-8 w-40" />
            <div className="flex gap-2">
              <SkeletonButton className="h-9 w-20" />
              <SkeletonButton className="h-9 w-20" />
            </div>
          </div>
          <HorizontalCardsSkeleton />
        </PanelSkeleton>
      ))}
    </PageShell>
  );
}

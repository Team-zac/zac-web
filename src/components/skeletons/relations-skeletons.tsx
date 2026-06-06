import { PageShell } from "@/components/page-shell";
import { PanelSkeleton, SkeletonBlock, SkeletonButton } from "@/components/skeletons/primitives";
import { GraphSkeleton, HeroSkeleton } from "@/components/skeletons/shared-layouts";

export function RelationsPageSkeleton() {
  return (
    <PageShell activeKey="characters">
      <HeroSkeleton />
      <PanelSkeleton>
        <div className="mb-4 flex items-center justify-between">
          <SkeletonBlock className="h-8 w-44" />
          <SkeletonButton className="h-9 w-24" />
        </div>
        <GraphSkeleton />
      </PanelSkeleton>
    </PageShell>
  );
}

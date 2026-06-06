import { PageShell } from "@/components/page-shell";
import { PanelSkeleton, SkeletonBlock, SkeletonButton } from "@/components/skeletons/primitives";
import { HeroSkeleton } from "@/components/skeletons/shared-layouts";
import type { ActiveKey } from "@/components/skeletons/types";

export function FormPageSkeleton({
  activeKey,
  fieldCount = 8,
}: {
  activeKey: ActiveKey;
  fieldCount?: number;
}) {
  return (
    <PageShell activeKey={activeKey}>
      <HeroSkeleton action={false} back />
      <PanelSkeleton>
        <div className="grid gap-[18px] md:grid-cols-2">
          {Array.from({ length: fieldCount }, (_, index) => (
            <div className={index % 5 === 4 ? "grid gap-2 md:col-span-2" : "grid gap-2"} key={index}>
              <SkeletonBlock className="h-5 w-28" />
              <SkeletonBlock className={index % 5 === 4 ? "h-36 w-full" : "h-[52px] w-full"} />
            </div>
          ))}
        </div>
        <div className="mt-[18px] flex justify-end gap-3">
          <SkeletonButton className="w-24" />
          <SkeletonButton className="w-28" />
        </div>
      </PanelSkeleton>
    </PageShell>
  );
}

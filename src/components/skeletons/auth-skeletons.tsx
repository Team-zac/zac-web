import { PageShell } from "@/components/page-shell";
import { PanelSkeleton, SkeletonBlock, SkeletonButton } from "@/components/skeletons/primitives";

export function AuthPageSkeleton({ fieldCount = 2 }: { fieldCount?: number }) {
  return (
    <PageShell>
      <section className="mx-auto grid w-full max-w-[680px] justify-items-center gap-6">
        <SkeletonBlock className="h-11 w-48" />
        <PanelSkeleton className="grid w-full gap-[18px]">
          {Array.from({ length: fieldCount }, (_, index) => (
            <div className="grid gap-2" key={index}>
              <SkeletonBlock className="h-5 w-24" />
              <SkeletonBlock className="h-[52px] w-full" />
            </div>
          ))}
          <SkeletonButton className="h-[42px] w-full" />
          <SkeletonBlock className="h-5 w-28 justify-self-center" />
        </PanelSkeleton>
      </section>
    </PageShell>
  );
}

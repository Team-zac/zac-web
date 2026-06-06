import { PageShell } from "@/components/page-shell";
import { CardSkeleton, PanelSkeleton, SkeletonBlock, SkeletonButton } from "@/components/skeletons/primitives";
import { HeroSkeleton } from "@/components/skeletons/shared-layouts";

export function SharePageSkeleton() {
  return (
    <PageShell activeKey="worlds">
      <HeroSkeleton back />
      <PanelSkeleton>
        <div className="mb-5 flex items-center justify-between">
          <SkeletonBlock className="h-8 w-44" />
          <SkeletonButton className="h-10 w-28" />
        </div>
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px_120px]">
          <SkeletonBlock className="h-[52px] w-full" />
          <SkeletonBlock className="h-[52px] w-full" />
          <SkeletonButton className="h-[52px] w-full" />
        </div>
      </PanelSkeleton>
      <PanelSkeleton>
        <SkeletonBlock className="mb-5 h-8 w-40" />
        <div className="grid gap-3">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </PanelSkeleton>
    </PageShell>
  );
}

export function ChapterEditorSkeleton() {
  return (
    <PageShell activeKey="works">
      <HeroSkeleton />
      <div className="grid grid-cols-[280px_minmax(0,1fr)] gap-5 max-lg:grid-cols-1">
        <PanelSkeleton>
          <SkeletonBlock className="mb-4 h-7 w-32" />
          <div className="grid gap-3">
            <CardSkeleton />
            <CardSkeleton />
          </div>
        </PanelSkeleton>
        <PanelSkeleton>
          <div className="mb-4 grid gap-2">
            <SkeletonBlock className="h-[52px] w-full" />
            <SkeletonBlock className="h-[52px] w-56" />
          </div>
          <SkeletonBlock className="h-[420px] w-full" />
        </PanelSkeleton>
      </div>
    </PageShell>
  );
}

export function ReaderSkeleton() {
  return (
    <PageShell activeKey="works">
      <HeroSkeleton back />
      <PanelSkeleton>
        <div className="mx-auto grid max-w-3xl gap-4">
          <SkeletonBlock className="h-8 w-3/4" />
          <SkeletonBlock className="h-5 w-44" />
          {Array.from({ length: 9 }, (_, index) => (
            <SkeletonBlock className={index % 3 === 2 ? "h-5 w-4/5" : "h-5 w-full"} key={index} />
          ))}
        </div>
      </PanelSkeleton>
    </PageShell>
  );
}

export function LandingSkeleton() {
  return (
    <PageShell>
      <section className="relative grid min-h-[calc(100vh-208px)] place-items-center overflow-hidden px-5">
        <div className="relative z-10 grid w-full max-w-[920px] justify-items-center gap-8 text-center">
          <SkeletonBlock className="h-24 w-full max-w-[720px]" />
          <SkeletonButton className="h-[52px] w-40" />
        </div>
      </section>
    </PageShell>
  );
}

export function PlaceholderSkeleton() {
  return (
    <PageShell>
      <HeroSkeleton action={false} />
      <PanelSkeleton>
        <SkeletonBlock className="h-48 w-full" />
      </PanelSkeleton>
    </PageShell>
  );
}

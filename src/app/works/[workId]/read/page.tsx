import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { PageShell } from "@/components/page-shell";
import { EntityLabel } from "@/components/ui/entity-label";
import { ButtonLink } from "@/components/ui/button";
import { WorkReader } from "@/components/works/work-reader";
import { BackButton } from "@/components/ui/back-button";
import { getWorkReaderData } from "@/features/works/data";
import { createSeoMetadata } from "@/lib/seo";

type WorkReaderPageProps = {
  params: Promise<{ workId: string }>;
  searchParams: Promise<{ chapter?: string }>;
};

export async function generateMetadata({
  params,
  searchParams,
}: WorkReaderPageProps) {
  const { workId } = await params;
  const query = await searchParams;
  const work = await getWorkReaderData(workId, query.chapter).catch(() => null);
  const chapterTitle = work?.currentChapter?.title;
  const title = work?.title
    ? chapterTitle
      ? `${work.title} - ${chapterTitle}`
      : `${work.title} 읽기`
    : "창작물 읽기";
  const description =
    work?.summary ??
    "세계관 기반 창작물의 챕터 본문을 읽는 화면입니다.";

  return createSeoMetadata({
    title,
    description,
    path: `/works/${workId}/read`,
  });
}

export default async function WorkReaderPage({
  params,
  searchParams,
}: WorkReaderPageProps) {
  const t = await getTranslations("works.reader");
  const { workId } = await params;
  const query = await searchParams;
  const work = await getWorkReaderData(workId, query.chapter);
  if (!work) notFound();
  return (
    <PageShell activeKey="works">
      <section className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-6 border-b border-white/15 pb-7 max-md:grid-cols-1">
        <div>
          <BackButton />
          <p className="mb-3 inline-flex rounded-full border border-[#E100FF]/35 bg-[#E100FF]/10 px-2.5 py-1 text-xs font-black uppercase"><EntityLabel name="work" /></p>
          <h1 className="text-4xl font-black">{work.title}</h1>
          <p className="mt-3 text-white/65">{work.summary ?? t("defaultSummary", { title: work.world.title })}</p>
        </div>
        <ButtonLink href={`/works/${work.id}`} tone="primary">{t("viewInfo")}</ButtonLink>
      </section>
      <WorkReader work={work} />
    </PageShell>
  );
}

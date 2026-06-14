import { notFound, redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { PageShell } from "@/components/page-shell";
import { EntityLabel } from "@/components/ui/entity-label";
import { Button, ButtonLink } from "@/components/ui/button";
import { ChapterEditor } from "@/components/works/chapter-editor";
import { publishWorkAction } from "@/features/works/actions";
import { getChapterEditorData } from "@/features/works/data";
import { createSeoMetadata } from "@/lib/seo";
import { requireUser } from "@/server/permissions";

export const metadata = createSeoMetadata({
  title: "챕터 에디터",
  description: "창작물 본문을 챕터 단위로 작성, 저장, 공개 상태를 관리하는 편집 화면입니다.",
});

export default async function ChapterEditorPage({
  params,
}: {
  params: Promise<{ workId: string }>;
}) {
  const t = await getTranslations("works.chapters");
  const user = await requireUser().catch(() => null);
  if (!user) redirect("/login");
  const { workId } = await params;
  const work = await getChapterEditorData(workId, user.id);
  if (!work) notFound();
  const publishAction = publishWorkAction.bind(null, work.id);
  return (
    <PageShell activeKey="works">
      <section className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-6 border-b border-white/15 pb-7 max-md:grid-cols-1">
        <div>
          <p className="mb-3 inline-flex rounded-full border border-[#E100FF]/35 bg-[#E100FF]/10 px-2.5 py-1 text-xs font-black uppercase"><EntityLabel name="chapter" /></p>
          <h1 className="text-4xl font-black">{t("title")}</h1>
          <p className="mt-3 text-white/65">{work.title} · {work.world.title}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ButtonLink href={`/works/${work.id}`}>{t("backToDetail")}</ButtonLink>
          <form action={publishAction}>
            <Button tone="primary" type="submit">{t("publish")}</Button>
          </form>
        </div>
      </section>
      <ChapterEditor chapters={work.chapters} workId={work.id} />
    </PageShell>
  );
}

import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { PageShell } from "@/components/page-shell";
import { ButtonLink } from "@/components/ui/button";
import { Panel } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { MarkdownViewer } from "@/components/ui/markdown-viewer";
import { EntityLabel } from "@/components/ui/entity-label";
import { WorkViewTracker } from "@/components/works/work-view-tracker";
import { BackButton } from "@/components/ui/back-button";
import { getWorkDetail } from "@/features/works/data";
import { createSeoMetadata } from "@/lib/seo";
import { getAuthSession } from "@/server/auth";

type WorkDetailPageProps = {
  params: Promise<{ workId: string }>;
};

export async function generateMetadata({ params }: WorkDetailPageProps) {
  const { workId } = await params;
  const work = await getWorkDetail(workId).catch(() => null);
  const title = work?.title ? `${work.title} 창작물` : "창작물 상세";
  const description =
    work?.summary ??
    work?.description ??
    "세계관 기반 창작물의 소개, 등장 캐릭터, 관련 소속과 챕터를 확인하는 상세 화면입니다.";

  return createSeoMetadata({
    title,
    description,
    path: `/works/${workId}`,
  });
}

export default async function WorkDetailPage({ params }: WorkDetailPageProps) {
  const [t, roles] = await Promise.all([
    getTranslations("works.detail"),
    getTranslations("works.form.roles"),
  ]);
  const roleLabel = {
    MAIN: roles("main"),
    MENTIONED: roles("mentioned"),
    OTHER: roles("other"),
    POV: roles("pov"),
    SUPPORTING: roles("supporting"),
  };
  const { workId } = await params;
  const [work, session] = await Promise.all([getWorkDetail(workId), getAuthSession()]);
  if (!work) notFound();
  const canEdit = Boolean(session?.user?.id && (work.world.ownerId === session.user.id || work.world.members?.some((member) => ["OWNER", "ADMIN", "EDITOR"].includes(member.role))));

  return (
    <PageShell activeKey="works">
      <WorkViewTracker workId={workId} />
      <section className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-6 border-b border-white/15 pb-7 max-md:grid-cols-1">
        <div>
          <BackButton />
          <p className="mb-3 inline-flex rounded-full border border-[#E100FF]/35 bg-[#E100FF]/10 px-2.5 py-1 text-xs font-black uppercase"><EntityLabel name="work" /></p>
          <h1 className="text-4xl font-black">{work.title}</h1>
          <p className="mt-3 text-white/65">{work.world.title} · {work.author?.name ?? t("creator")}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Chip active>{work.type.toLowerCase()}</Chip>
            <Chip>{work.visibility.toLowerCase()}</Chip>
            <Chip>{work.publishStatus.toLowerCase()}</Chip>
            {work.isOfficial ? <Chip active>official</Chip> : null}
            {work.workTags.map(({ tag }) => <Chip key={tag.id}>#{tag.name}</Chip>)}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <ButtonLink href={`/works/${work.id}/read`} tone="primary">{t("read")}</ButtonLink>
          {canEdit ? <ButtonLink href={`/works/${work.id}/chapters`}>{t("editChapters")}</ButtonLink> : null}
          {canEdit ? <ButtonLink href={`/works/${work.id}/edit`}>{t("editInformation")}</ButtonLink> : null}
        </div>
      </section>
      <Panel>
        <h2 className="mb-4 text-[28px] font-black">{t("introduction")}</h2>
        {work.description ? <MarkdownViewer>{work.description}</MarkdownViewer> : <p className="text-white/65">{t("descriptionEmpty")}</p>}
      </Panel>
      <div className="grid grid-cols-2 gap-5 max-lg:grid-cols-1">
        <Panel>
          <h2 className="mb-4 text-[24px] font-black">{t("characters")}</h2>
          <div className="grid gap-3">
            {work.workCharacters.length ? work.workCharacters.map(({ character, note, role }) => (
              <article className="rounded-lg border border-white/15 bg-black/25 p-4" key={character.id}>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <h3 className="text-xl font-black">{character.name}</h3>
                  <Chip active>{roleLabel[role]}</Chip>
                </div>
                <p className="text-white/65">{note ?? character.summary ?? t("appearanceNoteEmpty")}</p>
              </article>
            )) : <p className="rounded-lg border border-dashed border-white/15 p-6 text-center text-white/65">{t("noCharacters")}</p>}
          </div>
        </Panel>
        <Panel>
          <h2 className="mb-4 text-[24px] font-black">{t("affiliations")}</h2>
          <div className="grid gap-3">
            {work.workAffiliations.length ? work.workAffiliations.map(({ affiliation, note }) => (
              <article className="rounded-lg border border-white/15 bg-black/25 p-4" key={affiliation.id}>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <h3 className="text-xl font-black">{affiliation.name}</h3>
                  <Chip>{affiliation.type}</Chip>
                </div>
                <p className="text-white/65">{note ?? affiliation.description ?? t("affiliationNoteEmpty")}</p>
              </article>
            )) : <p className="rounded-lg border border-dashed border-white/15 p-6 text-center text-white/65">{t("noAffiliations")}</p>}
          </div>
        </Panel>
      </div>
      <Panel>
        <h2 className="mb-4 text-[24px] font-black">{t("chapters")}</h2>
        <div className="grid gap-3">
          {work.chapters.map((chapter) => (
            <a className="flex items-center justify-between gap-4 rounded-lg border border-white/15 bg-white/[0.04] p-4 hover:border-[#E100FF]/45" href={`/works/${work.id}/read?chapter=${chapter.number}#chapter-${chapter.number}`} key={chapter.id}>
              <div>
                <p className="text-[13px] font-black text-white/55"><EntityLabel name="chapter" /> {chapter.number}</p>
                <h3 className="text-xl font-black">{chapter.title}</h3>
              </div>
              <Chip>{chapter.publishStatus.toLowerCase()}</Chip>
            </a>
          ))}
        </div>
      </Panel>
    </PageShell>
  );
}

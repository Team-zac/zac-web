import { notFound, redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { PageShell } from "@/components/page-shell";
import { Panel } from "@/components/ui/card";
import { EntityLabel } from "@/components/ui/entity-label";
import { WorkForm } from "@/components/works/work-form";
import { updateWorkAction } from "@/features/works/actions";
import { getWorkForEdit } from "@/features/works/data";
import { createSeoMetadata } from "@/lib/seo";
import { requireUser } from "@/server/permissions";

export const metadata = createSeoMetadata({
  title: "창작물 수정",
  description: "창작물 정보, 공개 상태, 등장 캐릭터, 관련 소속과 태그를 수정하는 화면입니다.",
});

export default async function WorkEditPage({
  params,
}: {
  params: Promise<{ workId: string }>;
}) {
  const t = await getTranslations("works.edit");
  const user = await requireUser().catch(() => null);
  if (!user) redirect("/login");
  const { workId } = await params;
  const work = await getWorkForEdit(workId, user.id);
  if (!work) notFound();
  const action = updateWorkAction.bind(null, work.id);
  return (
    <PageShell activeKey="works">
      <section className="border-b border-white/15 pb-7">
        <p className="mb-3 inline-flex rounded-full border border-[#E100FF]/35 bg-[#E100FF]/10 px-2.5 py-1 text-xs font-black uppercase"><EntityLabel name="work" /></p>
        <h1 className="text-4xl font-black">{t("title")}</h1>
        <p className="mt-3 text-white/65">{t("description")}</p>
      </section>
      <Panel>
        <WorkForm
          action={action}
          cancelHref={`/works/${work.id}`}
          initialValues={{
            affiliations: work.workAffiliations.map((item) => ({ affiliationId: item.affiliationId, note: item.note ?? "" })),
            characters: work.workCharacters.map((item) => ({ characterId: item.characterId, note: item.note ?? "", role: item.role })),
            coverImageUrl: work.coverImageUrl,
            description: work.description,
            isOfficial: work.isOfficial,
            publishStatus: work.publishStatus,
            tags: work.workTags.map(({ tag }) => tag.name),
            title: work.title,
            type: work.type,
            visibility: work.visibility,
            worldId: work.worldId,
          }}
          submitLabel={t("submit")}
          worldLocked
          worlds={[work.world]}
        />
      </Panel>
    </PageShell>
  );
}

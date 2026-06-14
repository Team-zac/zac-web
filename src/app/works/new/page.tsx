import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { PageShell } from "@/components/page-shell";
import { Panel } from "@/components/ui/card";
import { EntityLabel } from "@/components/ui/entity-label";
import { WorkForm } from "@/components/works/work-form";
import { createWorkAction } from "@/features/works/actions";
import { getEditableWorkWorlds } from "@/features/works/data";
import { createSeoMetadata } from "@/lib/seo";
import { requireUser } from "@/server/permissions";

export const metadata = createSeoMetadata({
  title: "창작물 만들기",
  description: "세계관 기반 창작물의 제목, 소개, 공개 범위, 등장 캐릭터와 관련 소속을 생성하는 화면입니다.",
  path: "/works/new",
});

export default async function WorkCreatePage({
  searchParams,
}: {
  searchParams: Promise<{ worldId?: string }>;
}) {
  const t = await getTranslations("works.create");
  const user = await requireUser().catch(() => null);
  if (!user) redirect("/login");
  const params = await searchParams;
  const worlds = await getEditableWorkWorlds(user.id);
  if (!worlds.length) redirect("/worlds/new");
  const selectedWorld = params.worldId && worlds.some((world) => world.id === params.worldId) ? params.worldId : worlds[0].id;
  return (
    <PageShell activeKey="works">
      <section className="border-b border-white/15 pb-7">
        <p className="mb-3 inline-flex rounded-full border border-[#E100FF]/35 bg-[#E100FF]/10 px-2.5 py-1 text-xs font-black uppercase"><EntityLabel name="work" /></p>
        <h1 className="text-4xl font-black">{t("title")}</h1>
        <p className="mt-3 text-white/65">{t("description")}</p>
      </section>
      <Panel>
        <WorkForm action={createWorkAction} cancelHref="/works" initialValues={{ worldId: selectedWorld }} submitLabel={t("submit")} worlds={worlds} />
      </Panel>
    </PageShell>
  );
}

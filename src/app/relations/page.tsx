import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { PageShell } from "@/components/page-shell";
import { EntityLabel } from "@/components/ui/entity-label";
import { Panel } from "@/components/ui/card";
import { RelationGraph } from "@/components/relations/relation-graph";
import { getDefaultRelationWorld, getRelationGraphData } from "@/features/relations/data";
import { createSeoMetadata } from "@/lib/seo";
import { getAuthSession } from "@/server/auth";

export const metadata = createSeoMetadata({
  title: "관계도",
  description: "세계관 속 캐릭터 관계를 그래프로 확인하고 편집하는 관계도 화면입니다.",
  path: "/relations",
});

export default async function RelationsPage({
  searchParams,
}: {
  searchParams: Promise<{ worldId?: string }>;
}) {
  const t = await getTranslations("relations");
  const params = await searchParams;
  const session = await getAuthSession();
  const worldId = params.worldId ?? (await getDefaultRelationWorld(session?.user?.id))?.id;

  if (!worldId) {
    return (
      <PageShell activeKey="characters">
        <section className="border-b border-white/15 pb-7">
          <p className="mb-3 inline-flex rounded-full border border-[#E100FF]/35 bg-[#E100FF]/10 px-2.5 py-1 text-xs font-black uppercase">
              <EntityLabel name="graph" />
          </p>
          <h1 className="text-4xl leading-tight font-black">{t("title")}</h1>
          <p className="mt-3 max-w-[680px] text-white/65">
            {t("emptyDescription")}
          </p>
        </section>
        <Panel>
          <div className="grid min-h-52 place-items-center rounded-lg border border-dashed border-white/15 text-white/65">
            {t("empty")}
          </div>
        </Panel>
      </PageShell>
    );
  }

  if (!params.worldId) redirect(`/relations?worldId=${worldId}`);

  const graph = await getRelationGraphData(worldId);

  return (
    <PageShell activeKey="characters">
      <RelationGraph data={graph} showHero />
    </PageShell>
  );
}

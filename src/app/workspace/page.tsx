import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { CharacterCard } from "@/components/characters/character-card";
import { WorkspaceDrafts } from "@/components/drafts/draft-autosave";
import { PageShell } from "@/components/page-shell";
import { LogoutButton } from "@/components/workspace/logout-button";
import { ButtonLink } from "@/components/ui/button";
import { EntityLabel } from "@/components/ui/entity-label";
import { WorkCard } from "@/components/works/work-card";
import { WorldCard } from "@/components/worlds/world-card";
import type { CharacterCardData } from "@/features/characters/types";
import type { WorkCardData } from "@/features/works/types";
import { getWorkspaceData } from "@/features/workspace/data";
import type { WorldCardData } from "@/features/worlds/types";
import { createSeoMetadata } from "@/lib/seo";
import { requireUser } from "@/server/permissions";

export const metadata = createSeoMetadata({
  title: "내 작업실",
  description: "내 세계관, 캐릭터, 창작물과 임시저장 초안을 한곳에서 관리하는 작업실입니다.",
  path: "/workspace",
});

export default async function WorkspacePage() {
  const [t, common] = await Promise.all([
    getTranslations("workspace"),
    getTranslations("common"),
  ]);
  const user = await requireUser().catch(() => null);
  if (!user) redirect("/login");
  const displayName = user.name ?? user.email ?? t("userFallback");
  const data = await getWorkspaceData(user.id);

  return (
    <PageShell activeKey="workspace">
      <section className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-6 border-b border-white/15 pb-7 max-md:grid-cols-1">
        <div>
          <p className="mb-3 inline-flex w-fit rounded-full border border-[#E100FF]/35 bg-[#E100FF]/10 px-2.5 py-1 text-xs font-black text-white/80 uppercase">
            <EntityLabel name="workspace" />
          </p>
          <h1 className="text-4xl leading-tight font-black">{t("title")}</h1>
          <p className="mt-3 max-w-[680px] text-white/65">
            {t("description", { name: displayName })}
          </p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3" aria-label={t("summaryAria")}>
        <MetricCard
          href="/worlds"
          label={t("worlds")}
          value={t("worldCount", { count: data.worldCount })}
        />
        <MetricCard
          href="/characters"
          label={t("characters")}
          value={t("characterCount", { count: data.characterCount })}
        />
        <MetricCard
          href="/works"
          label={t("works")}
          value={t("itemCount", { count: data.workCount })}
        />
      </section>

      <section className="grid gap-4" aria-label={t("categoryAria")}>
        <article className="min-w-0 rounded-lg border border-white/15 bg-white/[0.055] p-[22px] shadow-[0_22px_54px_rgba(0,0,0,0.26)] backdrop-blur-xl">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="text-[28px] leading-tight font-black">{t("drafts")}</h2>
          </div>
          <WorkspaceDrafts />
        </article>
        <WorkspaceSection
          cards={data.worlds}
          createHref="/worlds/new"
          emptyText={t("empty", { resource: t("worlds") })}
          kind="worlds"
          listAria={t("listAria", { resource: t("worlds") })}
          manageLabel={common("manage")}
          addLabel={t("add")}
          title={t("worlds")}
          viewHref="/worlds"
        />
        <WorkspaceSection
          cards={data.characters}
          createHref="/characters/new"
          emptyText={t("empty", { resource: t("characters") })}
          kind="characters"
          listAria={t("listAria", { resource: t("characters") })}
          manageLabel={common("manage")}
          addLabel={t("add")}
          title={t("characters")}
          viewHref="/characters"
        />
        <WorkspaceSection
          cards={data.works}
          createHref="/works/new"
          emptyText={t("empty", { resource: t("works") })}
          kind="works"
          listAria={t("listAria", { resource: t("works") })}
          manageLabel={common("manage")}
          addLabel={t("add")}
          title={t("works")}
          viewHref="/works"
        />
      </section>

      <div className="flex justify-end">
        <LogoutButton />
      </div>
    </PageShell>
  );
}

function MetricCard({
  href,
  label,
  value,
}: {
  href: string;
  label: string;
  value: string;
}) {
  return (
    <a
      className="grid min-h-[118px] gap-1.5 rounded-lg border border-white/15 bg-white/[0.055] p-[18px] shadow-[0_22px_54px_rgba(0,0,0,0.26)] backdrop-blur-xl"
      href={href}
    >
      <span className="text-[13px] text-white/65">{label}</span>
      <strong className="text-[28px] leading-none font-black">{value}</strong>
    </a>
  );
}

function WorkspaceSection({
  cards,
  createHref,
  emptyText,
  kind,
  listAria,
  manageLabel,
  addLabel,
  title,
  viewHref,
}: {
  cards: CharacterCardData[] | WorkCardData[] | WorldCardData[];
  createHref: string;
  emptyText: string;
  kind: "characters" | "works" | "worlds";
  listAria: string;
  manageLabel: string;
  addLabel: string;
  title: string;
  viewHref: string;
}) {
  return (
    <article className="grid min-w-0 content-start gap-4 rounded-lg border border-white/15 bg-white/[0.055] p-[22px] shadow-[0_22px_54px_rgba(0,0,0,0.26)] backdrop-blur-xl">
      <div className="flex items-center justify-between gap-4 max-md:flex-col max-md:items-start">
        <h2 className="text-[28px] leading-tight font-black">{title}</h2>
        <div className="flex flex-wrap justify-end gap-2 max-md:justify-start">
          <ButtonLink
            className="min-h-[30px] px-3"
            href={viewHref}
            tone="primary"
          >
            {manageLabel}
          </ButtonLink>
          <ButtonLink className="min-h-[30px] px-3" href={createHref}>
            {addLabel}
          </ButtonLink>
        </div>
      </div>
      {cards.length ? (
        <div
          className="grid grid-flow-col auto-cols-[minmax(260px,320px)] gap-3.5 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          aria-label={listAria}
        >
          {cards.map((card) => (
            <WorkspaceResourceCard card={card} kind={kind} key={card.id} />
          ))}
        </div>
      ) : (
        <div className="grid min-h-[180px] place-items-center rounded-lg border border-dashed border-white/15 text-white/65">
          {emptyText}
        </div>
      )}
    </article>
  );
}

function WorkspaceResourceCard({
  card,
  kind,
}: {
  card: CharacterCardData | WorkCardData | WorldCardData;
  kind: "characters" | "works" | "worlds";
}) {
  if (kind === "worlds") return <WorldCard world={card as WorldCardData} />;
  if (kind === "characters") return <CharacterCard character={card as CharacterCardData} />;
  return <WorkCard work={card as WorkCardData} />;
}

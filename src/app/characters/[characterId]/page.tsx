import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { CharacterViewTracker } from "@/components/characters/character-view-tracker";
import { PageShell } from "@/components/page-shell";
import { ButtonLink } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { EntityLabel } from "@/components/ui/entity-label";
import { MarkdownViewer } from "@/components/ui/markdown-viewer";
import { BackButton } from "@/components/ui/back-button";
import { RelationGraph } from "@/components/relations/relation-graph";
import { getCharacterDetail } from "@/features/characters/data";
import { getRelationGraphData } from "@/features/relations/data";
import { createSeoMetadata } from "@/lib/seo";
import { getAuthSession } from "@/server/auth";
import { getWorldRole } from "@/server/permissions";

const panel =
  "rounded-lg border border-white/15 bg-white/[0.055] p-[22px] shadow-[0_22px_54px_rgba(0,0,0,0.26)] backdrop-blur-xl";

type ResourceCard = {
  description: string;
  href: string;
  label: string;
  meta: string;
  title: string;
};

function ResourceSection({
  cards,
  createHref,
  createLabel,
  emptyText,
  secondaryHref,
  secondaryLabel,
  title,
}: {
  cards: ResourceCard[];
  createHref?: string;
  createLabel?: string;
  emptyText: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  title: string;
}) {
  return (
    <section className={panel}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-[28px] font-black">{title}</h2>
        <div className="flex gap-2">
          {createHref && createLabel ? (
            <ButtonLink href={createHref} tone="primary">
              {createLabel}
            </ButtonLink>
          ) : null}
          {secondaryHref && secondaryLabel ? (
            <ButtonLink href={secondaryHref}>{secondaryLabel}</ButtonLink>
          ) : null}
        </div>
      </div>
      {cards.length ? (
        <div className="grid grid-flow-col auto-cols-[minmax(260px,320px)] gap-3.5 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {cards.map((card) => (
            <Link
              className="grid min-h-[210px] gap-3 rounded-lg border border-white/15 bg-white/[0.055] p-[18px] outline-none hover:border-[#E100FF]/50"
              href={card.href}
              key={card.href}
            >
              <div className="flex items-center justify-between gap-3">
                <Chip>{card.label}</Chip>
                <span className="text-[13px] text-white/65">{card.meta}</span>
              </div>
              <h3 className="text-xl font-black">{card.title}</h3>
              <p className="line-clamp-3 leading-relaxed text-white/65">{card.description}</p>
            </Link>
          ))}
        </div>
      ) : (
        <div className="grid min-h-32 place-items-center rounded-lg border border-dashed border-white/15 text-white/60">
          {emptyText}
        </div>
      )}
    </section>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ characterId: string }>;
}) {
  const { characterId } = await params;
  const character = await getCharacterDetail(characterId).catch(() => null);
  const title = character?.name ? `${character.name} 캐릭터` : "캐릭터 상세";
  const description =
    character?.summary ??
    character?.description ??
    "자작 캐릭터의 프로필, 상세 설정, 소속 이력, 등장 창작물과 관계를 확인하는 화면입니다.";

  return createSeoMetadata({
    title,
    description,
    path: `/characters/${characterId}`,
  });
}

export default async function CharacterDetailPage({
  params,
}: {
  params: Promise<{ characterId: string }>;
}) {
  const [t, common] = await Promise.all([
    getTranslations("characters.detail"),
    getTranslations("common"),
  ]);
  const { characterId } = await params;
  const character = await getCharacterDetail(characterId).catch(() => null);
  if (!character) notFound();
  const session = await getAuthSession();
  const role = session?.user?.id
    ? await getWorldRole(character.worldId, session.user.id)
    : null;
  const canEdit =
    character.world.ownerId === session?.user?.id ||
    role === "OWNER" ||
    role === "ADMIN" ||
    role === "EDITOR";
  const primary =
    character.affiliations.find(({ isPrimary }) => isPrimary) ??
    character.affiliations[0];
  const affiliationStatusLabel: Record<string, string> = {
    CURRENT: t("affiliationStatuses.current"),
    FORMER: t("affiliationStatuses.former"),
    UNKNOWN: t("affiliationStatuses.unknown"),
  };
  const relationGraph = await getRelationGraphData(character.worldId).catch(() => null);
  const works: ResourceCard[] = character.workCharacters.map(({ work }) => ({
    description: work.summary ?? t("workDescriptionEmpty"),
    href: `/works/${work.id}`,
    label: work.type,
    meta: common("views", { count: (Number(work.viewCount ?? 0)).toLocaleString() }),
    title: work.title,
  }));
  return (
    <PageShell activeKey="characters">
      <CharacterViewTracker characterId={characterId} />
      <section className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-6 border-b border-white/15 pb-7 max-md:grid-cols-1">
        <div>
          <BackButton />
          <p className="mb-3 inline-flex rounded-full border border-[#E100FF]/35 bg-[#E100FF]/10 px-2.5 py-1 text-xs font-black uppercase">
            <EntityLabel name="character" />
          </p>
          <h1 className="text-4xl font-black">{character.name}</h1>
          {character.alias ? (
            <p className="mt-2 text-white/65">{character.alias}</p>
          ) : null}
        </div>
        {canEdit ? (
          <div className="flex gap-2.5">
            <ButtonLink href={`/characters/${characterId}/edit`} tone="primary">
              {common("edit")}
            </ButtonLink>
            <ButtonLink href={`/affiliations?worldId=${character.worldId}`}>
              {t("manageAffiliations")}
            </ButtonLink>
          </div>
        ) : null}
      </section>
      <section className={panel}>
        <div className="mb-5 flex justify-between gap-3">
          <h2 className="text-[28px] font-black">{t("introduction")}</h2>
          <div className="flex flex-wrap gap-2">
            {character.characterTags.map(({ tag }) => (
              <Chip key={tag.id}>#{tag.name}</Chip>
            ))}
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Link
            className="grid gap-2 rounded-lg border border-white/15 bg-black/25 p-[18px]"
            href={`/worlds/${character.worldId}`}
          >
            <span className="text-[13px] text-white/65">{t("world")}</span>
            <h3 className="text-xl font-black">{character.world.title}</h3>
            <p className="text-white/65">
              {character.world.description ?? t("worldDescriptionEmpty")}
            </p>
          </Link>
          <div className="grid gap-2 rounded-lg border border-white/15 bg-black/25 p-[18px]">
            <span className="text-[13px] text-white/65">{t("affiliation")}</span>
            <h3 className="text-xl font-black">
              {primary?.affiliation.name ?? t("noAffiliation")}
            </h3>
            <p className="text-white/65">
              {primary
                ? [
                    primary.title,
                    primary.rank,
                    affiliationStatusLabel[primary.status],
                  ]
                    .filter(Boolean)
                    .join(" · ")
                : t("noConnectedAffiliation")}
            </p>
          </div>
        </div>
        <div className="mt-5 rounded-lg border border-white/10 bg-black/30 p-[18px]">
          <MarkdownViewer>
            {character.description ??
              character.summary ??
              t("descriptionFallback")}
          </MarkdownViewer>
        </div>
        {character.personality || character.background ? (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {character.personality ? (
              <div className="rounded-lg border border-white/10 p-4">
                <h3 className="mb-2 text-xl font-black">{t("personality")}</h3>
                <p className="whitespace-pre-wrap text-white/65">
                  {character.personality}
                </p>
              </div>
            ) : null}
            {character.background ? (
              <div className="rounded-lg border border-white/10 p-4">
                <h3 className="mb-2 text-xl font-black">{t("background")}</h3>
                <p className="whitespace-pre-wrap text-white/65">
                  {character.background}
                </p>
              </div>
            ) : null}
          </div>
        ) : null}
      </section>
      <ResourceSection
        cards={works}
        createHref={canEdit ? `/works/new?worldId=${character.worldId}` : undefined}
        createLabel={t("createWork")}
        emptyText={t("noWorks")}
        secondaryHref="/works"
        secondaryLabel={t("viewAll")}
        title={t("works")}
      />
      {relationGraph ? (
        <RelationGraph compact data={relationGraph} />
      ) : (
        <section className={panel}>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-[28px] font-black">{t("relations")}</h2>
            <ButtonLink className="min-h-[30px] px-3 text-[13px]" href={`/relations?worldId=${character.worldId}`}>
              {t("openRelations")}
            </ButtonLink>
          </div>
          <div className="grid min-h-52 place-items-center rounded-lg border border-dashed border-white/15 text-white/60">
            {t("noRelations")}
          </div>
        </section>
      )}
    </PageShell>
  );
}

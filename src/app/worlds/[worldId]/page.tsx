import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { PageShell } from "@/components/page-shell";
import { ButtonLink } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { MarkdownViewer } from "@/components/ui/markdown-viewer";
import { EntityLabel } from "@/components/ui/entity-label";
import { BackButton } from "@/components/ui/back-button";
import { WorldCover } from "@/components/worlds/world-cover";
import { WorldViewTracker } from "@/components/worlds/world-view-tracker";
import { RelationGraph } from "@/components/relations/relation-graph";
import { getWorldDetail } from "@/features/worlds/data";
import { getRelationGraphData } from "@/features/relations/data";
import { createSeoMetadata } from "@/lib/seo";
import { resolveRemoteImageUrl } from "@/lib/remote-image";
import { getAuthSession } from "@/server/auth";
import { getWorldRole } from "@/server/permissions";

type WorldDetailPageProps = {
  params: Promise<{ worldId: string }>;
};

type ResourceCard = {
  description: string;
  href: string;
  label: string;
  meta: string;
  title: string;
};

const panelClass =
  "min-w-0 rounded-lg border border-white/15 bg-white/[0.055] p-[22px] shadow-[0_22px_54px_rgba(0,0,0,0.26)] backdrop-blur-xl";

export async function generateMetadata({ params }: WorldDetailPageProps) {
  const { worldId } = await params;
  const world = await getWorldDetail(worldId).catch(() => null);
  const title = world?.title ? `${world.title} 세계관` : "세계관 상세";
  const description = world?.description ?? "세계관 소개, 캐릭터, 소속, 관계도와 창작물을 확인하는 상세 화면입니다.";

  return createSeoMetadata({
    title,
    description,
    path: `/worlds/${worldId}`,
  });
}

function ResourceSection({
  cards,
  createHref,
  createLabel,
  emptyText,
  title,
}: {
  cards: ResourceCard[];
  createHref?: string;
  createLabel: string;
  emptyText: string;
  title: string;
}) {
  return (
    <section className={panelClass}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-[28px] font-black">{title}</h2>
        {createHref ? (
          <ButtonLink href={createHref} tone="primary">
            {createLabel}
          </ButtonLink>
        ) : null}
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

export default async function WorldDetailPage({ params }: WorldDetailPageProps) {
  const [t, common] = await Promise.all([
    getTranslations("worlds.detail"),
    getTranslations("common"),
  ]);
  const { worldId } = await params;
  const world = await getWorldDetail(worldId).catch(() => null);
  if (!world) notFound();

  const session = await getAuthSession();
  const isOwner = session?.user?.id === world.ownerId;
  const role = session?.user?.id ? await getWorldRole(worldId, session.user.id) : null;
  const canEdit = isOwner || role === "OWNER" || role === "ADMIN" || role === "EDITOR";
  const canAdmin = isOwner || role === "OWNER" || role === "ADMIN";
  const coverImageUrl = await resolveRemoteImageUrl(world.coverImageUrl);
  const relationGraph = world.characters.length > 1
    ? await getRelationGraphData(worldId).catch(() => null)
    : null;

  const characters: ResourceCard[] = world.characters.map((character) => ({
    description: character.summary ?? character.description ?? t("characterDescriptionEmpty"),
    href: `/characters/${character.id}`,
    label: "Character",
    meta: common("views", { count: character.viewCount.toLocaleString() }),
    title: character.name,
  }));
  const affiliations: ResourceCard[] = world.affiliations.map((affiliation) => ({
    description: affiliation.description ?? t("affiliationDescriptionEmpty"),
    href: `/affiliations/${affiliation.id}`,
    label: affiliation.type,
    meta: affiliation.visibility.toLowerCase(),
    title: affiliation.name,
  }));
  const works: ResourceCard[] = world.works.map((work) => ({
    description: work.summary ?? t("workDescriptionEmpty"),
    href: `/works/${work.id}`,
    label: work.type,
    meta: common("views", { count: work.viewCount.toLocaleString() }),
    title: work.title,
  }));

  return (
    <PageShell activeKey="worlds">
      <WorldViewTracker worldId={worldId} />
      <section className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-6 border-b border-white/15 pb-7 max-md:grid-cols-1">
        <div>
          <BackButton />
          <p className="mb-3 inline-flex rounded-full border border-[#E100FF]/35 bg-[#E100FF]/10 px-2.5 py-1 text-xs font-black uppercase">
            <EntityLabel name="world" />
          </p>
          <h1 className="text-4xl leading-tight font-black">{world.title}</h1>
          <div className="mt-3 flex flex-wrap gap-2">
            <Chip active={world.visibility === "PUBLIC"}>{world.visibility.toLowerCase()}</Chip>
            {world.genre ? <Chip>{world.genre}</Chip> : null}
            {world.worldTags.map(({ tag }) => (
              <Chip key={tag.id}>#{tag.name}</Chip>
            ))}
          </div>
        </div>
        {canEdit || canAdmin ? (
          <div className="flex flex-wrap justify-end gap-2.5 max-md:justify-start">
            {canEdit ? (
              <ButtonLink href={`/worlds/${worldId}/edit`} tone="primary">
                {common("edit")}
              </ButtonLink>
            ) : null}
            {canAdmin ? <ButtonLink href={`/worlds/${worldId}/share`}>{t("share")}</ButtonLink> : null}
          </div>
        ) : null}
      </section>

      <section
        aria-label={t("coverAria")}
        className={`${panelClass} relative aspect-video w-full max-w-full overflow-hidden p-0 sm:aspect-[8/3]`}
      >
        <WorldCover imageUrl={coverImageUrl} title={world.title} />
      </section>

      <section className={panelClass} aria-labelledby="world-description-title">
        <h2 className="mb-5 text-[28px] font-black" id="world-description-title">
          {t("description")}
        </h2>
        <MarkdownViewer>
          {world.description ?? t("descriptionFallback")}
        </MarkdownViewer>
      </section>

      <section className={panelClass} aria-label={t("summaryAria")}>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            [t("characters"), t("characterCount", { count: world._count.characters })],
            [t("affiliations"), t("itemCount", { count: world._count.affiliations })],
            [t("works"), t("itemCount", { count: world._count.works })],
          ].map(([label, value]) => (
            <article
              className="grid gap-2 rounded-lg border border-white/15 bg-black/25 p-[18px]"
              key={label}
            >
              <span className="text-[13px] text-white/65">{label}</span>
              <h3 className="text-xl font-black">{value}</h3>
            </article>
          ))}
        </div>
      </section>

      <ResourceSection
        cards={characters}
        createHref={canEdit ? `/characters/new?worldId=${worldId}` : undefined}
        createLabel={t("addCharacter")}
        emptyText={t("emptyResource", { resource: t("characters") })}
        title={t("characters")}
      />
      <ResourceSection
        cards={affiliations}
        createHref={canEdit ? `/affiliations/new?worldId=${worldId}` : undefined}
        createLabel={t("addAffiliation")}
        emptyText={t("emptyResource", { resource: t("affiliations") })}
        title={t("affiliations")}
      />
      {relationGraph ? (
        <RelationGraph compact data={relationGraph} />
      ) : (
        <section className={panelClass}>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-[28px] font-black">{t("relations")}</h2>
            <ButtonLink className="min-h-[30px] px-3 text-[13px]" href="/relations">
              {t("viewGraph")}
            </ButtonLink>
          </div>
          <div className="grid min-h-52 place-items-center rounded-lg border border-dashed border-white/15 text-white/60">
            {t("relationRequirement")}
          </div>
        </section>
      )}
      <ResourceSection
        cards={works}
        createHref={canEdit ? `/works/new?worldId=${worldId}` : undefined}
        createLabel={t("addWork")}
        emptyText={t("emptyResource", { resource: t("works") })}
        title={t("works")}
      />
    </PageShell>
  );
}

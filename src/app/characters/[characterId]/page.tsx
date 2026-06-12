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
import { getCharacterDetail } from "@/features/characters/data";
import { createSeoMetadata } from "@/lib/seo";
import { getAuthSession } from "@/server/auth";
import { getWorldRole } from "@/server/permissions";

const panel =
  "rounded-lg border border-white/15 bg-white/[0.055] p-[22px] shadow-[0_22px_54px_rgba(0,0,0,0.26)] backdrop-blur-xl";

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
  const [t, common, roles, cards] = await Promise.all([
    getTranslations("characters.detail"),
    getTranslations("common"),
    getTranslations("works.form.roles"),
    getTranslations("cards.workTypes"),
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
  const workRoleLabel: Record<string, string> = {
    MAIN: roles("main"),
    MENTIONED: roles("mentioned"),
    OTHER: roles("other"),
    POV: roles("pov"),
    SUPPORTING: roles("supporting"),
  };
  const workTypeLabel: Record<string, string> = {
    EPISODE: cards("episode"),
    NOVEL: cards("novel"),
    OTHER: cards("other"),
    ROLEPLAY: cards("roleplay"),
    SETTING_NOTE: cards("settingNote"),
    SHORT_STORY: cards("shortStory"),
  };
  const relations = [
    ...character.sourceRelations.map((relation) => ({
      id: relation.id,
      name: relation.name,
      other: relation.targetCharacter,
    })),
    ...character.targetRelations.map((relation) => ({
      id: relation.id,
      name: relation.name,
      other: relation.sourceCharacter,
    })),
  ];
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
      <section className={panel}>
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 className="text-[28px] font-black">{t("works")}</h2>
          <div className="flex gap-2">
            {canEdit ? (
              <ButtonLink
                href={`/works/new?worldId=${character.worldId}`}
                tone="primary"
              >
                {t("createWork")}
              </ButtonLink>
            ) : null}
            <ButtonLink href="/works">{t("viewAll")}</ButtonLink>
          </div>
        </div>
        {character.workCharacters.length ? (
          <div className="grid grid-flow-col auto-cols-[minmax(260px,320px)] gap-3.5 overflow-x-auto">
            {character.workCharacters.map(({ role: workRole, work }) => (
              <Link
                className="grid min-h-[200px] gap-3 rounded-lg border border-white/15 p-[18px]"
                href={`/works/${work.id}`}
                key={work.id}
              >
                <div className="flex justify-between">
                  <Chip>{workTypeLabel[work.type]}</Chip>
                  <span className="text-[13px] text-white/65">
                    {workRoleLabel[workRole]}
                  </span>
                </div>
                <h3 className="text-xl font-black">{work.title}</h3>
                <p className="text-white/65">
                  {work.summary ?? t("workDescriptionEmpty")}
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="grid min-h-36 place-items-center rounded-lg border border-dashed border-white/15 text-white/60">
            {t("noWorks")}
          </div>
        )}
      </section>
      <section className={panel}>
        <div className="mb-5 flex justify-between">
          <h2 className="text-[28px] font-black">{t("relations")}</h2>
          <ButtonLink href={`/relations?worldId=${character.worldId}`}>
            {t("openRelations")}
          </ButtonLink>
        </div>
        {relations.length ? (
          <div className="relative min-h-[460px] overflow-auto rounded-lg border border-white/15 bg-[radial-gradient(circle_at_28%_24%,rgba(225,0,255,.24),transparent_22%),radial-gradient(circle_at_72%_76%,rgba(255,0,64,.22),transparent_24%)]">
            <div className="absolute top-1/2 left-1/2 grid w-36 -translate-1/2 gap-1 rounded-lg border border-[#E100FF]/50 bg-black/80 p-3">
              <strong>{character.name}</strong>
              <span className="text-[13px] text-white/65">
                {primary?.affiliation.name ?? t("noAffiliation")}
              </span>
            </div>
            {relations.slice(0, 6).map((relation, index) => (
              <Link
                className="absolute grid w-36 gap-1 rounded-lg border border-white/15 bg-black/80 p-3"
                href={`/characters/${relation.other.id}`}
                key={relation.id}
                style={{
                  left: `${15 + (index % 3) * 32}%`,
                  top: `${15 + Math.floor(index / 3) * 62}%`,
                }}
              >
                <strong>{relation.other.name}</strong>
                <span className="text-[13px] text-white/65">
                  {relation.name}
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="grid min-h-52 place-items-center rounded-lg border border-dashed border-white/15 text-white/60">
            {t("noRelations")}
          </div>
        )}
      </section>
    </PageShell>
  );
}

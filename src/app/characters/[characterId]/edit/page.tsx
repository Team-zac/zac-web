import { notFound, redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { CharacterForm } from "@/components/characters/character-form";
import { PageShell } from "@/components/page-shell";
import { Panel } from "@/components/ui/card";
import { EntityLabel } from "@/components/ui/entity-label";
import { BackButton } from "@/components/ui/back-button";
import { updateCharacterAction } from "@/features/characters/actions";
import { getCharacterForEdit } from "@/features/characters/data";
import { createSeoMetadata } from "@/lib/seo";
import { requireUser } from "@/server/permissions";

export const metadata = createSeoMetadata({
  title: "캐릭터 수정",
  description: "자작 캐릭터의 프로필, 상세 설정, 소속 이력, 공개 범위와 태그를 수정하는 화면입니다.",
});

export default async function CharacterEditPage({ params }: { params: Promise<{ characterId: string }> }) {
  const t = await getTranslations("characters.edit");
  const user = await requireUser().catch(() => null);
  if (!user) redirect("/login");
  const { characterId } = await params;
  const character = await getCharacterForEdit(characterId, user.id).catch(() => null);
  if (!character) notFound();
  const world = character.world;
  const action = updateCharacterAction.bind(null, characterId);
  return <PageShell activeKey="characters">
    <section className="border-b border-white/15 pb-7"><BackButton /><p className="mb-3 inline-flex rounded-full border border-[#E100FF]/35 bg-[#E100FF]/10 px-2.5 py-1 text-xs font-black uppercase"><EntityLabel name="character" /></p><h1 className="text-4xl font-black">{t("title")}</h1><p className="mt-3 text-white/65">{t("description")}</p></section>
    <Panel>
      <CharacterForm action={action} cancelHref={`/characters/${characterId}`} initialValues={{
        affiliations: character.affiliations.map((item) => ({ affiliationId: item.affiliationId, endedLabel: item.endedLabel ?? "", isPrimary: item.isPrimary, note: item.note ?? "", rank: item.rank ?? "", startedLabel: item.startedLabel ?? "", status: item.status, title: item.title ?? "" })),
        alias: character.alias, background: character.background, description: character.description, name: character.name, personality: character.personality, profileImageUrl: character.profileImageUrl, summary: character.summary, tags: character.characterTags.map(({ tag }) => tag.name), visibility: character.visibility, worldId: character.worldId,
      }} submitLabel={t("submit")} worldLocked worlds={[{ affiliations: world.affiliations, description: world.description, id: world.id, tags: world.worldTags.map(({ tag }) => tag.name), title: world.title }]} />
    </Panel>
  </PageShell>;
}

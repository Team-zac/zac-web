import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { CharacterForm } from "@/components/characters/character-form";
import { PageShell } from "@/components/page-shell";
import { Panel } from "@/components/ui/card";
import { EntityLabel } from "@/components/ui/entity-label";
import { BackButton } from "@/components/ui/back-button";
import { createCharacterAction } from "@/features/characters/actions";
import { getEditableWorlds } from "@/features/characters/data";
import { createSeoMetadata } from "@/lib/seo";
import { requireUser } from "@/server/permissions";

export const metadata = createSeoMetadata({
  title: "캐릭터 만들기",
  description: "세계관에 속한 자작 캐릭터의 프로필, 설정, 소속 이력과 태그를 생성하는 화면입니다.",
  path: "/characters/new",
});

export default async function CharacterCreatePage({ searchParams }: { searchParams: Promise<{ worldId?: string }> }) {
  const t = await getTranslations("characters.create");
  const user = await requireUser().catch(() => null);
  if (!user) redirect("/login");
  const [worlds, params] = await Promise.all([getEditableWorlds(user.id), searchParams]);
  const options = worlds.map((world) => ({
    affiliations: world.affiliations,
    description: world.description,
    id: world.id,
    tags: world.worldTags.map(({ tag }) => tag.name),
    title: world.title,
  }));
  const worldId = options.some(({ id }) => id === params.worldId) ? params.worldId : options[0]?.id;
  return <PageShell activeKey="characters">
    <section className="border-b border-white/15 pb-7"><BackButton /><p className="mb-3 inline-flex rounded-full border border-[#E100FF]/35 bg-[#E100FF]/10 px-2.5 py-1 text-xs font-black uppercase"><EntityLabel name="character" /></p><h1 className="text-4xl font-black">{t("title")}</h1><p className="mt-3 text-white/65">{t("description")}</p></section>
    <Panel>
      {options.length ? <CharacterForm action={createCharacterAction} cancelHref="/characters" initialValues={{ worldId }} submitLabel={t("submit")} worlds={options} /> : <p className="text-white/65">{t("emptyWorlds")}</p>}
    </Panel>
  </PageShell>;
}

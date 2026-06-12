import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

import { CharacterListManager } from "@/components/characters/character-list-manager";
import { PageShell } from "@/components/page-shell";
import { EntityLabel } from "@/components/ui/entity-label";
import { getMyCharacters } from "@/features/characters/data";
import { createSeoMetadata } from "@/lib/seo";
import { requireUser } from "@/server/permissions";

export const metadata = createSeoMetadata({
  title: "내 캐릭터 목록",
  description: "세계관별 자작 캐릭터와 공개 범위, 대표 소속을 관리하는 화면입니다.",
  path: "/characters",
});

export default async function CharactersPage() {
  const t = await getTranslations("characters.list");
  const user = await requireUser().catch(() => null);
  if (!user) redirect("/login");
  const characters = await getMyCharacters(user.id);
  return (
    <PageShell activeKey="characters">
      <section className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-6 border-b border-white/15 pb-7 max-md:grid-cols-1">
        <div>
          <p className="mb-3 inline-flex rounded-full border border-[#E100FF]/35 bg-[#E100FF]/10 px-2.5 py-1 text-xs font-black uppercase">
            <EntityLabel name="character" />
          </p>
          <h1 className="text-4xl font-black">{t("title")}</h1>
          <p className="mt-3 text-white/65">
            {t("description")}
          </p>
        </div>
        <Link
          className="inline-flex min-h-[42px] items-center justify-center rounded-lg bg-gradient-to-br from-[#E100FF] to-[#FF0040] px-[18px] font-black"
          href="/characters/new"
        >
          {t("create")}
        </Link>
      </section>
      <CharacterListManager characters={characters.characters} />
    </PageShell>
  );
}

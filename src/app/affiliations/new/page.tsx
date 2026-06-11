import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { AffiliationForm } from "@/components/affiliations/affiliation-form";
import { PageShell } from "@/components/page-shell";
import { Panel } from "@/components/ui/card";
import { EntityLabel } from "@/components/ui/entity-label";
import { BackButton } from "@/components/ui/back-button";
import { createAffiliationAction } from "@/features/affiliations/actions";
import { getEditableWorlds } from "@/features/characters/data";
import { createSeoMetadata } from "@/lib/seo";
import { requireUser } from "@/server/permissions";

export const metadata = createSeoMetadata({
  title: "소속 만들기",
  description: "세계관 내 조직, 진영, 국가, 가문 등 캐릭터 소속을 생성하는 화면입니다.",
  path: "/affiliations/new",
});

export default async function AffiliationCreatePage({ searchParams }: { searchParams: Promise<{ worldId?: string }> }) {
  const t = await getTranslations("affiliations.create");
  const user = await requireUser().catch(() => null);
  if (!user) redirect("/login");
  const [worlds, params] = await Promise.all([getEditableWorlds(user.id), searchParams]);
  const options = worlds.map((world) => ({ affiliations: world.affiliations, description: world.description, id: world.id, title: world.title }));
  const worldId = options.some(({ id }) => id === params.worldId) ? params.worldId : options[0]?.id;
  return <PageShell activeKey="characters"><section className="border-b border-white/15 pb-7"><BackButton /><p className="mb-3 inline-flex rounded-full border border-[#E100FF]/35 bg-[#E100FF]/10 px-2.5 py-1 text-xs font-black uppercase"><EntityLabel name="affiliation" /></p><h1 className="text-4xl font-black">{t("title")}</h1><p className="mt-3 text-white/65">{t("description")}</p></section><Panel>{options.length ? <AffiliationForm action={createAffiliationAction} cancelHref="/affiliations" initialValues={{ worldId }} submitLabel={t("submit")} worlds={options} /> : <p className="text-white/65">{t("emptyWorlds")}</p>}</Panel></PageShell>;
}

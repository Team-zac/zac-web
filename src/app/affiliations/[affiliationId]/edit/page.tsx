import { notFound, redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { AffiliationForm } from "@/components/affiliations/affiliation-form";
import { PageShell } from "@/components/page-shell";
import { Panel } from "@/components/ui/card";
import { EntityLabel } from "@/components/ui/entity-label";
import { BackButton } from "@/components/ui/back-button";
import { updateAffiliationAction } from "@/features/affiliations/actions";
import { getAffiliationForEdit } from "@/features/affiliations/data";
import { createSeoMetadata } from "@/lib/seo";
import { requireUser } from "@/server/permissions";

export const metadata = createSeoMetadata({
  title: "소속 수정",
  description: "세계관 내 캐릭터 소속의 설명, 유형, 상징 이미지, 대표 색상과 공개 범위를 수정하는 화면입니다.",
});

export default async function AffiliationEditPage({ params }: { params: Promise<{ affiliationId: string }> }) {
  const t = await getTranslations("affiliations.edit");
  const user = await requireUser().catch(() => null);
  if (!user) redirect("/login");
  const { affiliationId } = await params;
  const affiliation = await getAffiliationForEdit(affiliationId, user.id).catch(() => null);
  if (!affiliation) notFound();
  const action = updateAffiliationAction.bind(null, affiliationId);
  return <PageShell activeKey="characters"><section className="border-b border-white/15 pb-7"><BackButton /><p className="mb-3 inline-flex rounded-full border border-[#E100FF]/35 bg-[#E100FF]/10 px-2.5 py-1 text-xs font-black uppercase"><EntityLabel name="affiliation" /></p><h1 className="text-4xl font-black">{t("title")}</h1><p className="mt-3 text-white/65">{t("description")}</p></section><Panel><AffiliationForm action={action} cancelHref={`/affiliations/${affiliationId}`} initialValues={{ color: affiliation.color, description: affiliation.description, name: affiliation.name, parentId: affiliation.parentId, symbolImageUrl: affiliation.symbolImageUrl, type: affiliation.type, visibility: affiliation.visibility, worldId: affiliation.worldId }} submitLabel={t("submit")} worldLocked worlds={[{ affiliations: affiliation.world.affiliations, description: affiliation.world.description, id: affiliation.world.id, title: affiliation.world.title }]} /></Panel></PageShell>;
}

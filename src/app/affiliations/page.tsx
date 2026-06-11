import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { AffiliationListManager } from "@/components/affiliations/affiliation-list-manager";
import { PageShell } from "@/components/page-shell";
import { ButtonLink } from "@/components/ui/button";
import { EntityLabel } from "@/components/ui/entity-label";
import { getMyAffiliations } from "@/features/affiliations/data";
import { createSeoMetadata } from "@/lib/seo";
import { requireUser } from "@/server/permissions";

export const metadata = createSeoMetadata({
  title: "소속 목록",
  description: "세계관 안의 조직, 진영, 국가, 가문 등 캐릭터 소속을 조회하고 관리하는 화면입니다.",
  path: "/affiliations",
});

export default async function AffiliationsPage() {
  const t = await getTranslations("affiliations.list");
  const user = await requireUser().catch(() => null);
  if (!user) redirect("/login");
  const affiliations = await getMyAffiliations(user.id);
  return <PageShell activeKey="characters"><section className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-6 border-b border-white/15 pb-7 max-md:grid-cols-1"><div><p className="mb-3 inline-flex rounded-full border border-[#E100FF]/35 bg-[#E100FF]/10 px-2.5 py-1 text-xs font-black uppercase"><EntityLabel name="affiliation" /></p><h1 className="text-4xl font-black">{t("title")}</h1><p className="mt-3 text-white/65">{t("description")}</p></div><ButtonLink href="/affiliations/new" tone="primary">{t("create")}</ButtonLink></section><AffiliationListManager affiliations={affiliations} /></PageShell>;
}

import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { PageShell } from "@/components/page-shell";
import { EntityLabel } from "@/components/ui/entity-label";
import { ButtonLink } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { WorkListManager } from "@/components/works/work-list-manager";
import { getMyWorks } from "@/features/works/data";
import { createSeoMetadata } from "@/lib/seo";
import { normalizePage } from "@/lib/pagination";
import { requireUser } from "@/server/permissions";

export const metadata = createSeoMetadata({
  title: "내 창작물 목록",
  description: "세계관 기반 소설, 설정놀이, 설정 노트와 챕터를 관리하는 창작물 목록 화면입니다.",
  path: "/works",
});

export default async function WorksPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const t = await getTranslations("works.list");
  const user = await requireUser().catch(() => null);
  if (!user) redirect("/login");
  const params = await searchParams;
  const page = normalizePage(params.page);
  const result = await getMyWorks(user.id, page);
  return (
    <PageShell activeKey="works">
      <section className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-6 border-b border-white/15 pb-7 max-md:grid-cols-1">
        <div>
          <p className="mb-3 inline-flex rounded-full border border-[#E100FF]/35 bg-[#E100FF]/10 px-2.5 py-1 text-xs font-black uppercase"><EntityLabel name="work" /></p>
          <h1 className="text-4xl font-black">{t("title")}</h1>
          <p className="mt-3 text-white/65">{t("description")}</p>
        </div>
        <ButtonLink href="/works/new" tone="primary">{t("create")}</ButtonLink>
      </section>
      <WorkListManager works={result.works} />
      <Pagination
        currentPage={result.page}
        hrefForPage={(pageNumber) => pageNumber > 1 ? `/works?page=${pageNumber}` : "/works"}
        lastPage={result.pageCount}
      />
    </PageShell>
  );
}

import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

import { PageShell } from "@/components/page-shell";
import { EntityLabel } from "@/components/ui/entity-label";
import { Pagination } from "@/components/ui/pagination";
import { WorldListManager } from "@/components/worlds/world-list-manager";
import { getMyWorlds } from "@/features/worlds/data";
import { createSeoMetadata } from "@/lib/seo";
import { normalizePage } from "@/lib/pagination";
import { requireUser } from "@/server/permissions";

export const metadata = createSeoMetadata({
  title: "내 세계관 목록",
  description: "내가 소유하거나 공유받은 세계관을 조회하고 관리하는 화면입니다.",
  path: "/worlds",
});

export default async function WorldsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const t = await getTranslations("worlds.list");
  const user = await requireUser().catch(() => null);
  if (!user) redirect("/login");
  const params = await searchParams;
  const page = normalizePage(params.page);
  const result = await getMyWorlds(user.id, page);

  return (
    <PageShell activeKey="worlds">
      <section className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-6 border-b border-white/15 pb-7 max-md:grid-cols-1">
        <div>
          <p className="mb-3 inline-flex rounded-full border border-[#E100FF]/35 bg-[#E100FF]/10 px-2.5 py-1 text-xs font-black uppercase">
            <EntityLabel name="world" />
          </p>
          <h1 className="text-4xl leading-tight font-black">{t("title")}</h1>
          <p className="mt-3 max-w-[680px] text-white/65">
            {t("description")}
          </p>
        </div>
        <Link
          className="inline-flex min-h-[42px] items-center justify-center rounded-lg bg-gradient-to-br from-[#E100FF] to-[#FF0040] px-[18px] font-black shadow-[0_12px_30px_rgba(255,0,64,0.24)]"
          href="/worlds/new"
        >
          {t("create")}
        </Link>
      </section>
      <WorldListManager worlds={result.worlds} />
      <Pagination
        currentPage={result.page}
        hrefForPage={(pageNumber) => pageNumber > 1 ? `/worlds?page=${pageNumber}` : "/worlds"}
        lastPage={result.pageCount}
      />
    </PageShell>
  );
}

import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { PageShell } from "@/components/page-shell";
import { WorldCard } from "@/components/worlds/world-card";
import { getPublicWorlds } from "@/features/worlds/data";
import { createSeoMetadata } from "@/lib/seo";

export const metadata = createSeoMetadata({
  title: "세계관 검색",
  description: "공개 세계관을 키워드와 태그로 검색하고 인기순 또는 최신순으로 탐색할 수 있습니다.",
  path: "/worlds/explore",
});

type WorldsExplorePageProps = {
  searchParams: Promise<{ page?: string; q?: string; sort?: string }>;
};

function buildHref(query: string, sort: string, page: number) {
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  if (sort !== "popular") params.set("sort", sort);
  if (page > 1) params.set("page", String(page));
  const value = params.toString();
  return value ? `/worlds/explore?${value}` : "/worlds/explore";
}

export default async function WorldsExplorePage({ searchParams }: WorldsExplorePageProps) {
  const [t, tCommon] = await Promise.all([
    getTranslations("explore.worlds"),
    getTranslations("common"),
  ]);
  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const sort = params.sort === "latest" ? "latest" : "popular";
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);
  const result = await getPublicWorlds({ page, query, sort });

  return (
    <PageShell activeKey="worlds">
      <section className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-6 border-b border-white/15 pb-7 max-md:grid-cols-1">
        <div>
          <p className="mb-3 inline-flex rounded-full border border-[#E100FF]/35 bg-[#E100FF]/10 px-2.5 py-1 text-xs font-black uppercase">
            {tCommon("explore")}
          </p>
          <h1 className="text-4xl font-black">{t("title")}</h1>
          <p className="mt-3 max-w-[680px] text-white/65">
            {t("description")}
          </p>
        </div>
        <Link
          className="inline-flex min-h-[42px] items-center justify-center rounded-lg bg-gradient-to-br from-[#E100FF] to-[#FF0040] px-[18px] font-black"
          href="/worlds"
        >
          {t("cta")}
        </Link>
      </section>

      <section
        aria-label={t("criteria")}
        className="rounded-lg border border-white/15 bg-white/[0.055] p-[22px] shadow-[0_22px_54px_rgba(0,0,0,0.26)] backdrop-blur-xl"
      >
        <form className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-end gap-3 max-md:grid-cols-1">
          <label className="grid gap-2 font-black">
            {tCommon("searchKeywordOrTag")}
            <input
              className="min-h-[52px] rounded-lg border border-white/15 bg-black/50 px-4 outline-none focus:border-[#E100FF]/70"
              defaultValue={query}
              name="q"
              placeholder={t("placeholder")}
              type="search"
            />
          </label>
          <Link
            className="inline-flex min-h-[52px] items-center justify-center rounded-lg border border-white/15 bg-white/[0.06] px-[18px] font-black"
            href="/worlds/explore"
          >
            {tCommon("reset")}
          </Link>
          <button className="min-h-[52px] rounded-lg bg-gradient-to-br from-[#E100FF] to-[#FF0040] px-[18px] font-black">
            {tCommon("search")}
          </button>
        </form>
      </section>

      <article className="rounded-lg border border-white/15 bg-white/[0.055] p-[22px] shadow-[0_22px_54px_rgba(0,0,0,0.26)] backdrop-blur-xl">
        <div className="mb-5 flex items-center justify-between gap-3 max-md:items-start max-md:flex-col">
          <div>
            <h2 className="text-[28px] font-black">{t("results")}</h2>
            <p className="text-[13px] text-white/65">
              {t("found", { count: result.total.toLocaleString() })}
            </p>
          </div>
          <div className="flex gap-2" aria-label={tCommon("sort")}>
            <Link
              className={`rounded-lg border px-3 py-2 text-[13px] font-black ${
                sort === "popular"
                  ? "border-[#E100FF]/45 bg-[#E100FF]/15"
                  : "border-white/15 bg-white/[0.06]"
              }`}
              href={buildHref(query, "popular", 1)}
            >
              {tCommon("popular")}
            </Link>
            <Link
              className={`rounded-lg border px-3 py-2 text-[13px] font-black ${
                sort === "latest"
                  ? "border-[#E100FF]/45 bg-[#E100FF]/15"
                  : "border-white/15 bg-white/[0.06]"
              }`}
              href={buildHref(query, "latest", 1)}
            >
              {tCommon("latest")}
            </Link>
          </div>
        </div>
        {result.worlds.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {result.worlds.map((world) => (
              <WorldCard key={world.id} world={world} />
            ))}
          </div>
        ) : (
          <div className="grid min-h-52 place-items-center rounded-lg border border-dashed border-white/15 text-white/65">
            {t("empty")}
          </div>
        )}
        {result.pageCount > 1 ? (
          <nav
            className="mt-6 flex flex-wrap justify-center gap-2"
            aria-label={t("ariaResults")}
          >
            <Link
              aria-disabled={page <= 1}
              className={`rounded-lg border border-white/15 px-3 py-2 font-black ${
                page <= 1 ? "pointer-events-none opacity-40" : ""
              }`}
              href={buildHref(query, sort, Math.max(1, page - 1))}
            >
                {tCommon("previous")}
            </Link>
            {Array.from({ length: result.pageCount }, (_, index) => index + 1)
              .slice(Math.max(0, page - 3), page + 2)
              .map((pageNumber) => (
                <Link
                  aria-current={pageNumber === page ? "page" : undefined}
                  className={`rounded-lg border px-3 py-2 font-black ${
                    pageNumber === page
                      ? "border-[#E100FF]/55 bg-[#E100FF]/20"
                      : "border-white/15"
                  }`}
                  href={buildHref(query, sort, pageNumber)}
                  key={pageNumber}
                >
                  {pageNumber}
                </Link>
              ))}
            <Link
              aria-disabled={page >= result.pageCount}
              className={`rounded-lg border border-white/15 px-3 py-2 font-black ${
                page >= result.pageCount ? "pointer-events-none opacity-40" : ""
              }`}
              href={buildHref(
                query,
                sort,
                Math.min(result.pageCount, page + 1),
              )}
            >
                {tCommon("next")}
            </Link>
          </nav>
        ) : null}
      </article>
    </PageShell>
  );
}

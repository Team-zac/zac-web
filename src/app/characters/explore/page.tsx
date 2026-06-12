import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { CharacterCard } from "@/components/characters/character-card";
import { PageShell } from "@/components/page-shell";
import { ButtonLink } from "@/components/ui/button";
import { getPublicCharacters } from "@/features/characters/data";
import { createSeoMetadata } from "@/lib/seo";

export const metadata = createSeoMetadata({
  title: "캐릭터 검색",
  description: "공개 자작 캐릭터를 이름, 세계관, 소속, 태그로 검색하고 탐색할 수 있습니다.",
  path: "/characters/explore",
});

function href(query: string, sort: string, page = 1) {
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  if (sort !== "popular") params.set("sort", sort);
  if (page > 1) params.set("page", String(page));
  return params.size ? `/characters/explore?${params}` : "/characters/explore";
}
export default async function CharacterExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; sort?: string }>;
}) {
  const [t, tCommon] = await Promise.all([
    getTranslations("explore.characters"),
    getTranslations("common"),
  ]);
  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const sort = params.sort === "latest" ? "latest" : "popular";
  const page = Math.max(1, Number.parseInt(params.page ?? "1") || 1);
  const result = await getPublicCharacters({ page, query, sort });
  return (
    <PageShell activeKey="characters">
      <section className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-6 border-b border-white/15 pb-7 max-md:grid-cols-1">
        <div>
          <p className="mb-3 inline-flex rounded-full border border-[#E100FF]/35 bg-[#E100FF]/10 px-2.5 py-1 text-xs font-black uppercase">
            {tCommon("explore")}
          </p>
          <h1 className="text-4xl font-black">{t("title")}</h1>
          <p className="mt-3 text-white/65">
            {t("description")}
          </p>
        </div>
        <ButtonLink href="/characters" tone="primary">
          {t("cta")}
        </ButtonLink>
      </section>
      <section className="rounded-lg border border-white/15 bg-white/[0.055] p-[22px] shadow-[0_22px_54px_rgba(0,0,0,0.26)] backdrop-blur-xl">
        <form className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-end gap-3 max-md:grid-cols-1">
          <label className="grid gap-2 font-black">
            {tCommon("searchKeywordOrTag")}
            <input
              className="min-h-[52px] rounded-lg border border-white/15 bg-black/50 px-4"
              defaultValue={query}
              name="q"
              placeholder={t("placeholder")}
              type="search"
            />
          </label>
          <Link
            className="grid min-h-[52px] place-items-center rounded-lg border border-white/15 bg-white/[0.06] px-[18px] font-black"
            href="/characters/explore"
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
              {t("resultDescription")}
            </p>
          </div>
          <div className="flex h-fit w-fit flex-none items-center gap-2 self-center max-md:self-start">
            <Link
              className={`rounded-lg border px-3 py-2 text-[13px] font-black ${
                sort === "popular"
                  ? "border-[#E100FF]/45 bg-[#E100FF]/15"
                  : "border-white/15 bg-white/[0.06]"
              }`}
              href={href(query, "popular", 1)}
            >
              {tCommon("popular")}
            </Link>
            <Link
              className={`rounded-lg border px-3 py-2 text-[13px] font-black ${
                sort === "latest"
                  ? "border-[#E100FF]/45 bg-[#E100FF]/15"
                  : "border-white/15 bg-white/[0.06]"
              }`}
              href={href(query, "latest", 1)}
            >
              {tCommon("latest")}
            </Link>
          </div>
        </div>
        {result.characters.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {result.characters.map((character) => (
              <CharacterCard character={character} key={character.id} />
            ))}
          </div>
        ) : (
          <div className="grid min-h-52 place-items-center rounded-lg border border-dashed border-white/15 text-white/65">
            {t("empty")}
          </div>
        )}
        {result.pageCount > 1 ? (
          <nav className="mt-6 flex justify-center gap-2">
            {Array.from(
              { length: result.pageCount },
              (_, index) => index + 1,
            ).map((number) => (
              <Link
                className={`rounded-lg border px-3 py-2 font-black ${number === page ? "border-[#E100FF]/55 bg-[#E100FF]/20" : "border-white/15"}`}
                href={href(query, sort, number)}
                key={number}
              >
                {number}
              </Link>
            ))}
          </nav>
        ) : null}
      </article>
    </PageShell>
  );
}

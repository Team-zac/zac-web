import Link from "next/link";
import { useTranslations } from "next-intl";

type PaginationProps = {
  currentPage?: number;
  hrefForPage?: (page: number) => string;
  lastPage?: number;
};

function pageClassName(active = false, disabled = false) {
  return [
    "inline-flex min-h-[42px] items-center justify-center rounded-lg border px-[18px] font-black whitespace-nowrap outline-none focus-visible:ring-3 focus-visible:ring-[#E100FF]/45 focus-visible:ring-offset-4 focus-visible:ring-offset-black",
    active
      ? "border-transparent bg-gradient-to-br from-[#E100FF] to-[#FF0040] text-white shadow-[0_12px_30px_rgba(255,0,64,0.24)]"
      : "border-white/20 bg-white/[0.06] text-white",
    disabled ? "pointer-events-none opacity-40" : "",
  ].filter(Boolean).join(" ");
}

export function Pagination({
  currentPage = 1,
  hrefForPage = (page) => `?page=${page}`,
  lastPage = 1,
}: PaginationProps) {
  const t = useTranslations("common");
  if (lastPage <= 1) return null;
  const pages = Array.from({ length: lastPage }, (_, index) => index + 1)
    .slice(Math.max(0, currentPage - 3), currentPage + 2);

  return (
    <nav
      className="flex flex-wrap justify-center gap-2 pt-5"
      aria-label={t("pageNavigation")}
    >
      <Link
        aria-disabled={currentPage <= 1}
        className={pageClassName(false, currentPage <= 1)}
        href={hrefForPage(Math.max(1, currentPage - 1))}
      >
        {t("previous")}
      </Link>
      {pages[0] > 1 ? (
        <Link className={pageClassName(currentPage === 1)} href={hrefForPage(1)}>
          1
        </Link>
      ) : null}
      {pages[0] > 2 ? (
        <span className={pageClassName(false, true)} aria-hidden="true">...</span>
      ) : null}
      {pages.map((page) => (
        <Link
          aria-current={page === currentPage ? "page" : undefined}
          className={pageClassName(page === currentPage)}
          href={hrefForPage(page)}
          key={page}
        >
          {page}
        </Link>
      ))}
      {pages.at(-1)! < lastPage - 1 ? (
        <span className={pageClassName(false, true)} aria-hidden="true">...</span>
      ) : null}
      {pages.at(-1)! < lastPage ? (
        <Link className={pageClassName(currentPage === lastPage)} href={hrefForPage(lastPage)}>
          {lastPage}
        </Link>
      ) : null}
      <Link
        aria-disabled={currentPage >= lastPage}
        className={pageClassName(false, currentPage >= lastPage)}
        href={hrefForPage(Math.min(lastPage, currentPage + 1))}
      >
        {t("next")}
      </Link>
    </nav>
  );
}

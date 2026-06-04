import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { LogoutConfirmButton } from "@/components/auth/logout-confirm-button";
import { LanguageSwitcher } from "@/components/language-switcher";
import { mainNavItems, type MainNavItem } from "@/lib/navigation";
import { getAuthSession } from "@/server/auth";

type AppHeaderProps = {
  activeKey?: MainNavItem["key"];
};

function TabIcon({ itemKey }: { itemKey: MainNavItem["key"] }) {
  const paths =
    itemKey === "worlds"
      ? [
          "M3 12h18",
          "M12 3c2.4 2.7 3.6 5.7 3.6 9s-1.2 6.3-3.6 9",
          "M12 3c-2.4 2.7-3.6 5.7-3.6 9s1.2 6.3 3.6 9",
        ]
      : itemKey === "characters"
        ? ["M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8", "M5 21c1.2-4 3.5-6 7-6s5.8 2 7 6"]
        : itemKey === "works"
          ? ["M5 4h10a4 4 0 0 1 4 4v12H9a4 4 0 0 0-4-4z", "M5 4v12", "M9 8h6", "M9 12h5"]
          : ["M4 6h6l2 3h8v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z", "M4 9h16"];

  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
    >
      {paths.map((path) => (
        <path d={path} key={path} />
      ))}
    </svg>
  );
}

export async function AppHeader({ activeKey }: AppHeaderProps) {
  const [session, tNav, tCommon] = await Promise.all([
    getAuthSession(),
    getTranslations("nav"),
    getTranslations("common"),
  ]);
  const navLinks = mainNavItems.map((item) => (
    <Link
      key={item.key}
      className={[
        "inline-flex min-h-[38px] items-center justify-center rounded-lg px-3.5 font-extrabold whitespace-nowrap text-white/75 outline-none focus-visible:bg-gradient-to-br focus-visible:from-[#E100FF]/20 focus-visible:to-[#FF0040]/20 focus-visible:text-white max-md:grid max-md:min-h-[58px] max-md:min-w-[72px] max-md:place-items-center max-md:gap-1 max-md:px-2 max-md:py-1.5",
        item.key === activeKey
          ? "bg-gradient-to-br from-[#E100FF]/20 to-[#FF0040]/20 text-white"
          : "",
      ].join(" ")}
      href={item.href}
    >
      <span className="hidden max-md:block">
        <TabIcon itemKey={item.key} />
      </span>
      <span className="max-md:text-[11px] max-md:leading-none">{tNav(item.key)}</span>
    </Link>
  ));
  const bottomNavLinks = mainNavItems.map((item) => (
    <Link
      key={item.key}
      className={[
        "grid min-h-[52px] place-items-center gap-1 rounded-lg p-1 text-xs font-extrabold whitespace-nowrap text-white/75 outline-none focus-visible:bg-gradient-to-br focus-visible:from-[#E100FF]/20 focus-visible:to-[#FF0040]/20 focus-visible:text-white",
        item.key === activeKey
          ? "bg-gradient-to-br from-[#E100FF]/20 to-[#FF0040]/20 text-white"
          : "",
      ].join(" ")}
      href={item.href}
    >
      <TabIcon itemKey={item.key} />
      <span>{tNav(item.key)}</span>
    </Link>
  ));

  return (
    <>
      <header className="fixed top-0 left-0 z-20 w-full px-5 py-5 [@media(max-width:512px)]:px-3.5 [@media(max-width:512px)]:py-4">
        <div className="mx-auto flex min-h-16 w-full max-w-7xl items-center justify-between gap-5 rounded-lg border border-white/15 bg-black/80 py-2.5 pr-3 pl-[18px] shadow-[0_18px_48px_rgba(0,0,0,0.38)] backdrop-blur-xl [@media(max-width:512px)]:justify-start">
          <Link
            className="inline-flex min-h-10 items-center gap-2.5 text-xl font-black whitespace-nowrap outline-none focus-visible:ring-3 focus-visible:ring-[#E100FF]/45 focus-visible:ring-offset-4 focus-visible:ring-offset-black"
            href="/"
            aria-label={tNav("home")}
          >
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-[#E100FF] to-[#FF0040] text-base font-black shadow-[0_12px_30px_rgba(225,0,255,0.26)]">
              Z
            </span>
            <span className="max-md:hidden [@media(max-width:512px)]:inline">
              Zac
            </span>
          </Link>
          <nav
            className="ml-auto flex items-center gap-1.5 rounded-lg bg-white/[0.05] p-1.5 max-md:hidden"
            aria-label={tNav("main")}
          >
            {navLinks}
          </nav>
          {session?.user ? (
            <div className="ml-0 flex shrink-0 items-center gap-2 [@media(max-width:512px)]:ml-auto">
              <LanguageSwitcher />
              <LogoutConfirmButton
                className="inline-flex min-h-[42px] w-[48px] items-center justify-center rounded-lg border border-white/15 bg-white/[0.06] px-0 font-black whitespace-nowrap text-white max-md:border-transparent max-md:bg-transparent"
                iconOnly
              />
            </div>
          ) : (
            <div className="ml-0 flex shrink-0 items-center gap-2 [@media(max-width:512px)]:ml-auto">
              <LanguageSwitcher />
              <Link
                className="inline-flex min-h-[42px] items-center justify-center rounded-lg border border-transparent bg-gradient-to-br from-[#E100FF] to-[#FF0040] px-[18px] font-black whitespace-nowrap text-white shadow-[0_12px_30px_rgba(255,0,64,0.24)]"
                href="/login"
              >
                {tCommon("login")}
              </Link>
            </div>
          )}
        </div>
      </header>
      <nav
        className="fixed right-3 bottom-3 left-3 z-30 hidden grid-cols-4 rounded-lg border border-white/15 bg-black/85 p-1.5 shadow-[0_18px_48px_rgba(0,0,0,0.46)] backdrop-blur-xl max-md:grid"
        aria-label={tNav("mobile")}
      >
        {bottomNavLinks}
      </nav>
    </>
  );
}

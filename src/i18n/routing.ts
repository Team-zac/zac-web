import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  defaultLocale: "ko",
  localeCookie: {
    name: "NEXT_LOCALE",
    sameSite: "lax",
  },
  localeDetection: true,
  localePrefix: "never",
  locales: ["ko", "en"],
});

export type AppLocale = (typeof routing.locales)[number];

export function isAppLocale(locale: string | undefined): locale is AppLocale {
  return locale === "ko" || locale === "en";
}

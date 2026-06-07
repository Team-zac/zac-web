"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import type { AppLocale } from "@/i18n/routing";

export function LanguageSwitcher() {
  const currentLocale = useLocale() as AppLocale;
  const t = useTranslations("language");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const nextLocale: AppLocale = currentLocale === "ko" ? "en" : "ko";
  const localeLabels: Record<AppLocale, string> = {
    en: t("english"),
    ko: t("korean"),
  };

  function changeLocale(locale: AppLocale) {
    if (locale === currentLocale || pending) return;

    startTransition(async () => {
      await fetch("/api/locale", {
        body: JSON.stringify({ locale }),
        headers: { "content-type": "application/json" },
        method: "POST",
      });
      router.refresh();
    });
  }

  return (
    <button
      aria-label={t("switchTo", { locale: localeLabels[nextLocale] })}
      className="inline-flex min-h-[42px] w-[48px] items-center justify-center rounded-lg border border-transparent bg-transparent font-black text-white outline-none focus-visible:ring-2 focus-visible:ring-[#E100FF]/45"
      disabled={pending}
      onClick={() => changeLocale(nextLocale)}
      type="button"
    >
      <svg aria-hidden="true" className="h-6 w-6" viewBox="0 0 24 24">
        <rect
          fill="none"
          height="18"
          rx="5"
          stroke="currentColor"
          strokeWidth="1.8"
          width="18"
          x="3"
          y="3"
        />
        <text
          dominantBaseline="central"
          fill="currentColor"
          fontSize="10"
          fontWeight="900"
          textAnchor="middle"
          x="12"
          y="12.5"
        >
          {currentLocale === "ko" ? "K" : "E"}
        </text>
      </svg>
      <span className="sr-only">{t("current", { locale: localeLabels[currentLocale] })}</span>
    </button>
  );
}

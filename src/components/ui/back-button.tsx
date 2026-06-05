"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

import { waitForPendingViewCount } from "@/components/view-count/view-count-navigation";

export function BackButton() {
  const t = useTranslations("common");
  const router = useRouter();

  async function handleBack() {
    await waitForPendingViewCount();
    router.refresh();
    window.setTimeout(() => {
      router.back();
    }, 0);
  }

  return (
    <button
      className="mb-2.5 flex w-fit cursor-pointer items-center gap-1.5 border-0 bg-transparent p-0 text-[13px] font-black text-white/65"
      onClick={handleBack}
      type="button"
    >
      <svg
        aria-hidden="true"
        className="h-4 w-4 fill-none stroke-current stroke-2 [stroke-linecap:round] [stroke-linejoin:round]"
        viewBox="0 0 24 24"
      >
        <path d="M19 12H5" />
        <path d="m12 19-7-7 7-7" />
      </svg>
      {t("back")}
    </button>
  );
}

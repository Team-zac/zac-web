"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useState } from "react";

function CoverFallback() {
  return (
    <div className="relative h-full w-full overflow-hidden bg-[#08080b]">
      <div className="absolute -top-1/3 -left-[8%] h-[120%] w-[58%] rotate-12 rounded-[50%] bg-[#E100FF]/35 blur-3xl" />
      <div className="absolute -right-[6%] -bottom-1/2 h-[130%] w-[62%] -rotate-12 rounded-[50%] bg-[#FF0040]/35 blur-3xl" />
      <div className="absolute top-[16%] right-[18%] h-28 w-28 rounded-full bg-white/15 blur-md" />
    </div>
  );
}

export function WorldCover({ imageUrl, title }: { imageUrl: string | null; title: string }) {
  const t = useTranslations("worlds.detail");
  const [failed, setFailed] = useState(false);

  if (!imageUrl || failed) {
    return <CoverFallback />;
  }

  return (
    <Image
      alt={t("coverAlt", { title })}
      className="object-cover"
      fill
      onError={() => setFailed(true)}
      sizes="(max-width: 640px) calc(100vw - 28px), (max-width: 1280px) calc(100vw - 40px), 1240px"
      src={imageUrl}
      unoptimized={imageUrl.toLowerCase().includes(".svg")}
    />
  );
}

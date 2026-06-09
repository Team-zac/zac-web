import Link from "next/link";
import { useTranslations } from "next-intl";

import { Chip } from "@/components/ui/chip";
import type { WorldCardData } from "@/features/worlds/types";

export function WorldCard({
  selectable = false,
  selected = false,
  world,
}: {
  selectable?: boolean;
  selected?: boolean;
  world: WorldCardData;
}) {
  const t = useTranslations("common");
  const visibilityLabel = world.visibility === "PUBLIC" ? t("public") : world.visibility.toLowerCase();
  const content = (
    <>
      <div className="flex items-center justify-between gap-3">
        <Chip active={world.visibility === "PUBLIC"}>{visibilityLabel}</Chip>
        <span className="text-[13px] text-white/65">
          {world.role?.toLowerCase() ?? t("views", { count: world.viewCount.toLocaleString() })}
        </span>
      </div>
      <h3 className="text-xl leading-tight font-black">{world.title}</h3>
      <p className="line-clamp-3 leading-relaxed text-white/65">{world.description}</p>
      <div className="mt-auto flex flex-wrap gap-2">
        {world.tags.slice(0, 4).map((tag) => (
          <Chip key={tag}>#{tag}</Chip>
        ))}
        {!world.tags.length && world.genre ? <Chip>{world.genre}</Chip> : null}
      </div>
      {selectable ? (
        <span
          className={[
            "absolute top-3 right-3 grid h-6 w-6 place-items-center rounded-full border text-xs font-black",
            selected
              ? "border-[#FF0040] bg-[#FF0040] text-white"
              : "border-white/25 bg-black/70 text-transparent",
          ].join(" ")}
          aria-hidden="true"
        >
          ✓
        </span>
      ) : null}
    </>
  );
  const className = [
    "relative grid min-h-[240px] gap-3 rounded-lg border p-[18px] text-left shadow-[0_22px_54px_rgba(0,0,0,0.26)] transition outline-none",
    selected
      ? "border-[#FF0040]/80 bg-[#FF0040]/10 ring-2 ring-[#FF0040]/20"
      : "border-white/15 bg-white/[0.055] hover:border-[#E100FF]/50",
  ].join(" ");

  return selectable ? (
    <div className={className}>{content}</div>
  ) : (
    <Link className={className} href={`/worlds/${world.id}`}>
      {content}
    </Link>
  );
}

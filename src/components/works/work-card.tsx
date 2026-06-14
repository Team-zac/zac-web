import Link from "next/link";
import { useTranslations } from "next-intl";

import { Chip } from "@/components/ui/chip";
import type { WorkCardData } from "@/features/works/types";

export function WorkCard({
  selectable,
  selected,
  work,
}: {
  selectable?: boolean;
  selected?: boolean;
  work: WorkCardData;
}) {
  const t = useTranslations();
  const typeLabel = {
    EPISODE: t("cards.workTypes.episode"),
    NOVEL: t("cards.workTypes.novel"),
    OTHER: t("cards.workTypes.other"),
    ROLEPLAY: t("cards.workTypes.roleplay"),
    SETTING_NOTE: t("cards.workTypes.settingNote"),
    SHORT_STORY: t("cards.workTypes.shortStory"),
  };
  const content = (
    <>
      <div className="flex items-center justify-between gap-3">
        <Chip active={selected}>{typeLabel[work.type]}</Chip>
        <span className="text-[13px] text-white/65">{t("common.views", { count: work.viewCount.toLocaleString() })}</span>
      </div>
      <div>
        <h3 className="text-xl font-black">{work.title}</h3>
        <p className="mt-1 text-[13px] text-white/55">{work.worldTitle}</p>
      </div>
      <p className="line-clamp-3 leading-relaxed text-white/65">{work.summary}</p>
      <div className="flex flex-wrap gap-2">
        <Chip>{work.visibility.toLowerCase()}</Chip>
        <Chip>{work.publishStatus.toLowerCase()}</Chip>
        <Chip>{t("cards.chapterCount", { count: work.chapterCount })}</Chip>
        {work.tags.slice(0, 3).map((tag) => <Chip key={tag}>#{tag}</Chip>)}
      </div>
    </>
  );
  const className = `grid min-h-[220px] gap-3 rounded-lg border bg-white/[0.055] p-[18px] text-left ${
    selected ? "border-[#E100FF]/60" : "border-white/15"
  }`;
  return selectable ? <div className={className}>{content}</div> : (
    <Link className={`${className} outline-none hover:border-[#E100FF]/50`} href={`/works/${work.id}`}>
      {content}
    </Link>
  );
}

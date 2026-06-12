import Link from "next/link";
import { useTranslations } from "next-intl";

import { Chip } from "@/components/ui/chip";
import { EntityLabel } from "@/components/ui/entity-label";
import type { CharacterCardData } from "@/features/characters/types";

export function CharacterCard({
  character,
  selectable,
  selected,
}: {
  character: CharacterCardData;
  selectable?: boolean;
  selected?: boolean;
}) {
  const t = useTranslations("common");
  const content = (
    <>
      <div className="flex items-center justify-between gap-3">
        <Chip active={selected}><EntityLabel name="character" /></Chip>
        <span className="text-[13px] text-white/65">{t("views", { count: character.viewCount.toLocaleString() })}</span>
      </div>
      <div>
        <h3 className="text-xl font-black">{character.name}</h3>
        {character.alias ? <p className="mt-1 text-[13px] text-white/55">{character.alias}</p> : null}
      </div>
      <p className="line-clamp-3 leading-relaxed text-white/65">{character.summary}</p>
      <div className="flex flex-wrap gap-2">
        <Chip>{character.worldTitle}</Chip>
        {character.primaryAffiliation ? <Chip>{character.primaryAffiliation}</Chip> : null}
        {character.tags.slice(0, 3).map((tag) => <Chip key={tag}>#{tag}</Chip>)}
      </div>
    </>
  );
  const className = `grid min-h-[220px] gap-3 rounded-lg border bg-white/[0.055] p-[18px] text-left ${
    selected ? "border-[#E100FF]/60" : "border-white/15"
  }`;
  return selectable ? <div className={className}>{content}</div> : (
    <Link className={`${className} outline-none hover:border-[#E100FF]/50`} href={`/characters/${character.id}`}>
      {content}
    </Link>
  );
}

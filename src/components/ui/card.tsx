import Link from "next/link";
import type { ReactNode } from "react";

import { Chip } from "@/components/ui/chip";

export type PreviewCardProps = {
  title: string;
  label: string;
  description: string;
  href?: string;
  meta?: string;
  tags?: string[];
};

export function Panel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <article
      className={[
        "min-w-0 rounded-lg border border-white/15 bg-white/[0.055] p-[22px] shadow-[0_22px_54px_rgba(0,0,0,0.26)] backdrop-blur-xl",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </article>
  );
}

export function PreviewCard({
  description,
  href,
  label,
  meta,
  tags = [],
  title,
}: PreviewCardProps) {
  const content = (
    <>
      <div className="flex items-center justify-between gap-4">
        <Chip active>{label}</Chip>
        {meta ? (
          <span className="inline-flex min-h-7 w-fit items-center rounded-full border border-white/20 px-2.5 text-[13px] font-black whitespace-nowrap text-white/70">
            {meta}
          </span>
        ) : null}
      </div>
      <h3 className="text-xl leading-tight font-black">{title}</h3>
      <p className="text-white/65">{description}</p>
      {tags.length ? (
        <div className="flex flex-wrap items-center gap-2">
          {tags.map((tag) => (
            <Chip key={tag}>{tag}</Chip>
          ))}
        </div>
      ) : null}
    </>
  );

  if (!href) {
    return (
      <div className="grid min-h-[220px] w-[360px] min-w-[360px] gap-3 rounded-lg border border-white/15 bg-white/[0.055] p-[18px] shadow-[0_22px_54px_rgba(0,0,0,0.26)] backdrop-blur-xl max-[516px]:w-[82vw] max-[516px]:min-w-[82vw]">
        {content}
      </div>
    );
  }

  return (
    <Link
      className="grid min-h-[220px] w-[360px] min-w-[360px] gap-3 rounded-lg border border-white/15 bg-white/[0.055] p-[18px] shadow-[0_22px_54px_rgba(0,0,0,0.26)] backdrop-blur-xl outline-none focus-visible:border-[#E100FF]/50 max-[516px]:w-[82vw] max-[516px]:min-w-[82vw]"
      href={href}
    >
      {content}
    </Link>
  );
}

export function HorizontalCardScroll({ children }: { children: ReactNode }) {
  return (
    <div className="-mx-0.5 flex max-w-full min-w-0 gap-[18px] overflow-x-auto px-0.5 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {children}
    </div>
  );
}

"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect, useMemo } from "react";

import { Button } from "@/components/ui/button";
import { EntityLabel } from "@/components/ui/entity-label";
import { sanitizeMarkdownLine } from "@/lib/markdown";

type ReaderWork = {
  chapters: { id: string; number: number; title: string }[];
  currentChapter: { body: string; id: string; number: number; title: string } | null;
  id: string;
  title: string;
  world: { title: string };
};

export function WorkReader({ work }: { work: ReaderWork }) {
  const t = useTranslations("works.reader");
  const currentNumber = work.currentChapter?.number ?? work.chapters[0]?.number ?? 1;
  const index = Math.max(0, work.chapters.findIndex((item) => item.number === currentNumber));
  const progress = work.chapters.length ? Math.round(((index + 1) / work.chapters.length) * 100) : 0;
  const blocks = useMemo(() => parseMarkdownBlocks(work.currentChapter?.body ?? ""), [work.currentChapter]);

  useEffect(() => {
    const match = window.location.hash.match(/chapter-(\d+)/);
    const number = match ? Number.parseInt(match[1], 10) : null;
    if (!number || number === currentNumber || new URLSearchParams(window.location.search).has("chapter")) return;
    if (work.chapters.some((item) => item.number === number)) {
      window.location.replace(readerHref(work.id, number));
    }
  }, [currentNumber, work.chapters, work.id]);

  function move(nextIndex: number) {
    const bounded = Math.min(Math.max(nextIndex, 0), work.chapters.length - 1);
    window.location.href = readerHref(work.id, work.chapters[bounded]?.number ?? 1);
  }
  function moveFromPointer(clientX: number, track: HTMLDivElement) {
    const rect = track.getBoundingClientRect();
    const ratio = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1);
    move(Math.round(ratio * Math.max(work.chapters.length - 1, 0)));
  }

  return (
    <article className="rounded-lg border border-white/15 bg-black p-[clamp(24px,5vw,54px)] text-white shadow-[0_22px_54px_rgba(0,0,0,0.26)]">
      <nav aria-label={t("chapterNavigation")} className="mb-4 flex flex-wrap gap-2">
        {work.chapters.map((item, itemIndex) => (
          <Link
            aria-label={t("goToChapter", { number: item.number })}
            className={`inline-flex h-10 min-w-11 items-center justify-center rounded-lg border px-3 font-extrabold text-white ${itemIndex === index ? "border-[#E100FF]/70 bg-gradient-to-br from-[#E100FF] to-[#FF0040] shadow-[0_14px_32px_rgba(225,0,255,0.22)]" : "border-white/15 bg-white/[0.08]"}`}
            href={readerHref(work.id, item.number)}
            key={item.id}
          >
            {item.number}
          </Link>
        ))}
      </nav>
      <div aria-label={t("progressAria", { current: index + 1, total: work.chapters.length })} className="mb-7 grid gap-3">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[13px] font-black text-white/55">{t("progress", { current: index + 1, total: work.chapters.length })}</span>
          <span className="text-[13px] font-black text-white/55">{progress}%</span>
        </div>
        <div
          aria-label={t("chapterProgress")}
          aria-valuemax={Math.max(work.chapters.length, 1)}
          aria-valuemin={1}
          aria-valuenow={index + 1}
          className="relative h-2 cursor-pointer rounded-full bg-white/12 outline-none focus-visible:ring-3 focus-visible:ring-[#E100FF]/35 focus-visible:ring-offset-4 focus-visible:ring-offset-black"
          onKeyDown={(event) => {
            if (event.key === "ArrowLeft") move(index - 1);
            if (event.key === "ArrowRight") move(index + 1);
          }}
          onPointerDown={(event) => {
            event.currentTarget.setPointerCapture(event.pointerId);
            moveFromPointer(event.clientX, event.currentTarget);
          }}
          onPointerMove={(event) => {
            if (event.currentTarget.hasPointerCapture(event.pointerId)) moveFromPointer(event.clientX, event.currentTarget);
          }}
          role="slider"
          tabIndex={0}
        >
          <div className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-br from-[#E100FF] to-[#FF0040]" style={{ width: `${progress}%` }} />
        </div>
      </div>
      <span className="mb-3 inline-flex w-fit rounded-full border border-[#E100FF]/35 bg-[#E100FF]/10 px-2.5 py-1 text-xs font-black uppercase text-white/80" id={`chapter-${currentNumber}`}>
        <EntityLabel name="chapter" /> {work.currentChapter?.number ?? 0}
      </span>
      <div className="grid gap-0">
        {blocks.length ? blocks.map((block, blockIndex) => {
          if (block.type === "h2") return <h2 className="mt-3 mb-6 text-[28px] font-black text-white" key={blockIndex}>{block.text}</h2>;
          if (block.type === "h3") return <h3 className="mt-8 text-xl font-black text-white" key={blockIndex}>{block.text}</h3>;
          if (block.type === "ul") return <ul className="mt-4 ml-5 grid list-disc gap-1 leading-[1.8] text-white/85" key={blockIndex}>{block.items.map((item) => <li key={item}>{item}</li>)}</ul>;
          return <p className="mt-[18px] leading-[1.8] text-white/85" key={blockIndex}>{block.text}</p>;
        }) : <p className="mt-[18px] leading-[1.8] text-white/65">{t("empty")}</p>}
      </div>
      <div aria-label={t("previousNextNavigation")} className="mt-9 flex justify-center gap-3 border-t border-white/12 pt-5">
        <Button className="min-w-32" disabled={index === 0} onClick={() => move(index - 1)} type="button">{t("previousChapter")}</Button>
        <Button className="min-w-32" disabled={index >= work.chapters.length - 1} onClick={() => move(index + 1)} tone="primary" type="button">{t("nextChapter")}</Button>
      </div>
    </article>
  );
}

function readerHref(workId: string, chapterNumber: number) {
  return `/works/${workId}/read?chapter=${chapterNumber}#chapter-${chapterNumber}`;
}

type MarkdownBlock =
  | { text: string; type: "h2" | "h3" | "p" }
  | { items: string[]; type: "ul" };

function parseMarkdownBlocks(markdown: string): MarkdownBlock[] {
  const blocks: MarkdownBlock[] = [];
  let list: string[] = [];
  function flushList() {
    if (!list.length) return;
    blocks.push({ items: list, type: "ul" });
    list = [];
  }
  markdown.split("\n").forEach((line) => {
    const value = sanitizeMarkdownLine(line);
    if (!value) {
      flushList();
      return;
    }
    if (value.startsWith("- ")) {
      list.push(value.slice(2));
      return;
    }
    flushList();
    if (value.startsWith("## ")) blocks.push({ text: value.slice(3), type: "h3" });
    else if (value.startsWith("# ")) blocks.push({ text: value.slice(2), type: "h2" });
    else blocks.push({ text: value, type: "p" });
  });
  flushList();
  return blocks;
}

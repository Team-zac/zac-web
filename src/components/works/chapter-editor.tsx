"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { PublishStatus, Visibility, WorkChapter } from "@prisma/client";

import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/card";
import { EntityLabel } from "@/components/ui/entity-label";

const draftIndexKey = "zac:drafts:index";

export function ChapterEditor({ chapters, workId }: { chapters: WorkChapter[]; workId: string }) {
  const t = useTranslations("works.editor");
  const [selectedId, setSelectedId] = useState(chapters[0]?.id ?? "");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const selected = useMemo(() => chapters.find((chapter) => chapter.id === selectedId) ?? chapters[0], [chapters, selectedId]);

  useEffect(() => {
    if (!chapters.some((chapter) => chapter.id === selectedId)) setSelectedId(chapters[0]?.id ?? "");
  }, [chapters, selectedId]);

  function run(action: () => Promise<void>) {
    setError("");
    startTransition(async () => {
      try {
        await action();
        router.refresh();
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : t("requestFailed"));
      }
    });
  }

  return (
    <section className="grid grid-cols-[260px_minmax(0,1fr)] gap-4 max-[900px]:grid-cols-1">
      <Panel className="h-fit">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-[28px] leading-tight font-black">{t("chapterList")}</h2>
          <Button className="min-h-[38px] px-4" disabled={pending} onClick={() => run(async () => {
            await fetch(`/api/works/${workId}/chapters`, { method: "POST" });
          })} tone="primary" type="button">
            {t("add")}
          </Button>
        </div>
        <div className="grid gap-2.5">
          {chapters.map((chapter) => (
            <div
              className={`grid cursor-pointer grid-cols-[minmax(0,1fr)_auto] items-start gap-x-3 gap-y-2.5 rounded-lg border p-3 ${selected?.id === chapter.id ? "border-[#E100FF]/50 bg-white/[0.045]" : "border-white/10 bg-white/[0.045]"}`}
              key={chapter.id}
              onClick={() => setSelectedId(chapter.id)}
              style={{ gridTemplateAreas: '"chapter status" "title delete"' }}
            >
              <span className="inline-flex min-h-7 w-fit items-center rounded-full border border-[#E100FF]/35 bg-[#E100FF]/10 px-2.5 text-xs font-black text-white/80 uppercase [grid-area:chapter]">
                <EntityLabel name="chapter" /> {chapter.number}
              </span>
              <strong className="min-w-0 text-white [grid-area:title]">{chapter.title}</strong>
              <span
                className={`inline-flex min-h-7 w-fit items-center rounded-full border px-2.5 text-xs font-black uppercase [grid-area:status] ${
                  chapter.publishStatus === "DRAFT"
                    ? "border-[#E100FF]/50 bg-gradient-to-br from-[#E100FF]/25 to-[#FF0040]/20 text-white"
                    : "border-[#E100FF]/35 bg-[#E100FF]/10 text-white/80"
                }`}
              >
                {chapter.publishStatus.toLowerCase()}
              </span>
              <button
                aria-label={t("deleteChapter")}
                className="grid h-[34px] w-[34px] place-items-center rounded-lg border-0 bg-transparent text-white/80 hover:text-white disabled:opacity-50 [grid-area:delete]"
                disabled={pending}
                onClick={(event) => {
                  event.stopPropagation();
                  setSelectedId(chapter.id);
                  run(async () => {
                    await fetch(`/api/works/${workId}/chapters/${chapter.id}`, { method: "DELETE" });
                  });
                }}
                type="button"
              >
                <svg
                  aria-hidden="true"
                  className="h-4 w-4 fill-none stroke-current stroke-2 [stroke-linecap:round] [stroke-linejoin:round]"
                  viewBox="0 0 24 24"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </Panel>
      <article className="grid min-h-[560px] gap-3.5 rounded-lg bg-black p-0 text-white">
        {error ? <p className="mb-4 rounded-lg border border-[#FF0040]/40 bg-[#FF0040]/10 px-4 py-3 font-black text-[#ff91ac]">{error}</p> : null}
        {selected ? (
          <ChapterForm
            chapter={selected}
            disabled={pending}
            onSave={(formData) => run(async () => {
              await fetch(`/api/works/${workId}/chapters/${selected.id}`, { body: formData, method: "PATCH" });
            })}
          />
        ) : (
          <div className="grid min-h-80 place-items-center rounded-lg border border-dashed border-white/15 text-white/65">
            {t("empty")}
          </div>
        )}
      </article>
    </section>
  );
}

function ChapterForm({
  chapter,
  disabled,
  onSave,
}: {
  chapter: WorkChapter;
  disabled: boolean;
  onSave: (formData: FormData) => void;
}) {
  const t = useTranslations("works.editor");
  const [title, setTitle] = useState(chapter.title);
  const [body, setBody] = useState(chapter.body);
  const [visibility, setVisibility] = useState<Visibility>(chapter.visibility);
  const [publishStatus, setPublishStatus] = useState<PublishStatus>(chapter.publishStatus);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setTitle(chapter.title);
    setBody(chapter.body);
    setVisibility(chapter.visibility);
    setPublishStatus(chapter.publishStatus);
  }, [chapter]);

  useEffect(() => {
    const draftParam = searchParams.get("draftKey");
    const draftKey = draftParam ? `zac:draft:${draftParam}` : `zac:draft:${pathname}:${chapter.id}`;
    const raw = localStorage.getItem(draftKey);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as { data?: { body?: string; publishStatus?: PublishStatus; title?: string; visibility?: Visibility } };
      if (parsed.data?.title) setTitle(parsed.data.title);
      if (parsed.data?.body) setBody(parsed.data.body);
      if (parsed.data?.visibility) setVisibility(parsed.data.visibility);
      if (parsed.data?.publishStatus) setPublishStatus(parsed.data.publishStatus);
    } catch {
      // Ignore broken local drafts so the editor remains usable.
    }
  }, [chapter.id, pathname, searchParams]);

  useEffect(() => {
    const draftKey = `zac:draft:${pathname}:${chapter.id}`;
    const timer = window.setTimeout(() => {
      const entry = {
        description: body || t("bodyDraft"),
        href: `${pathname}?draftKey=${encodeURIComponent(`${pathname}:${chapter.id}`)}`,
        key: draftKey,
        kind: "chapter",
        savedAt: Date.now(),
        title: title || t("untitled"),
      };
      localStorage.setItem(draftKey, JSON.stringify({ data: { body, publishStatus, title, visibility }, entry }));
      const index = JSON.parse(localStorage.getItem(draftIndexKey) ?? "[]");
      const next = Array.isArray(index) ? [entry, ...index.filter((item) => item?.key !== draftKey)] : [entry];
      localStorage.setItem(draftIndexKey, JSON.stringify(next.sort((a, b) => b.savedAt - a.savedAt).slice(0, 24)));
      window.dispatchEvent(new Event("zac:drafts-changed"));
    }, 600);
    return () => window.clearTimeout(timer);
  }, [body, chapter.id, pathname, publishStatus, t, title, visibility]);

  function submit() {
    const formData = new FormData();
    formData.set("title", title);
    formData.set("body", body);
    formData.set("visibility", visibility);
    formData.set("publishStatus", publishStatus);
    const draftKey = `zac:draft:${pathname}:${chapter.id}`;
    localStorage.removeItem(draftKey);
    try {
      const index = JSON.parse(localStorage.getItem(draftIndexKey) ?? "[]");
      if (Array.isArray(index)) localStorage.setItem(draftIndexKey, JSON.stringify(index.filter((item) => item?.key !== draftKey)));
      window.dispatchEvent(new Event("zac:drafts-changed"));
    } catch {
      // Nothing to clean up.
    }
    onSave(formData);
  }
  function insertMarkdown(value: string) {
    const textarea = textareaRef.current;
    if (!textarea) {
      setBody((current) => `${current}${current ? "\n" : ""}${value}`);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const before = body.slice(0, start);
    const after = body.slice(end);
    const prefix = before && !before.endsWith("\n") ? "\n" : "";
    const insertText = `${prefix}${value}`;
    const nextBody = `${before}${insertText}${after}`;
    setBody(nextBody);
    window.requestAnimationFrame(() => {
      textarea.focus();
      const cursor = before.length + insertText.length;
      textarea.setSelectionRange(cursor, cursor);
    });
  }

  return (
    <div className="grid gap-3.5">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3 max-[900px]:grid-cols-1">
        <input
          aria-label={t("titlePlaceholder")}
          className="w-full rounded-none border-0 border-b border-white/15 bg-transparent px-0 pt-0 pb-3 text-[28px] leading-tight font-black text-white outline-none placeholder:text-white/40 focus:border-b-[#E100FF] focus:ring-0"
          onChange={(event) => setTitle(event.target.value)}
          placeholder={t("titlePlaceholder")}
          value={title}
        />
        <Button disabled={disabled} onClick={submit} tone="primary" type="button">
          {disabled ? t("saving") : t("saveChapter")}
        </Button>
      </div>
      <div className="flex flex-wrap items-center gap-2" aria-label={t("toolbarAria")}>
        {[
          ["# 제목", t("markdownHeading")],
          ["## 소제목", t("markdownSubheading")],
          ["- 목록 항목", t("markdownList")],
          ["**굵게**", t("markdownBold")],
          ["> 인용문", t("markdownQuote")],
          ["`키워드`", t("markdownKeyword")],
        ].map(([syntax, label]) => (
          <button className="inline-flex min-h-7 items-center justify-center rounded-full border border-white/15 bg-white/[0.06] px-2.5 text-[13px] font-extrabold text-white/80" key={syntax} onClick={() => insertMarkdown(syntax)} type="button">
            {label}
          </button>
        ))}
        <select
          aria-label={t("publishStatus")}
          className="ml-auto min-h-9 w-auto min-w-[150px] rounded-lg border border-white/15 bg-black/40 px-3 text-white outline-none focus:border-[#E100FF]/70 focus:ring-3 focus:ring-[#E100FF]/15 max-[900px]:ml-0 max-[900px]:w-full"
          onChange={(event) => setPublishStatus(event.target.value as PublishStatus)}
          value={publishStatus}
        >
          <option>DRAFT</option><option>PUBLISHED</option><option>ARCHIVED</option>
        </select>
        <select
          aria-label={t("visibility")}
          className="min-h-9 w-auto min-w-[150px] rounded-lg border border-white/15 bg-black/40 px-3 text-white outline-none focus:border-[#E100FF]/70 focus:ring-3 focus:ring-[#E100FF]/15 max-[900px]:w-full"
          onChange={(event) => setVisibility(event.target.value as Visibility)}
          value={visibility}
        >
          <option>PRIVATE</option><option>SHARED</option><option>PUBLIC</option>
        </select>
      </div>
      <textarea
        aria-label={t("bodyAria")}
        className="min-h-[460px] w-full resize-y rounded-lg border border-white/20 bg-black p-3.5 leading-[1.75] text-white outline-none placeholder:text-white/40 focus:border-[#E100FF]/70 focus:ring-3 focus:ring-[#E100FF]/15"
        onChange={(event) => setBody(event.target.value)}
        ref={textareaRef}
        value={body}
      />
    </div>
  );
}

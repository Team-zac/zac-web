"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import { Chip } from "@/components/ui/chip";

type DraftKind = "affiliation" | "chapter" | "character" | "work" | "world";

type DraftEntry = {
  description: string;
  href: string;
  key: string;
  kind: DraftKind;
  savedAt: number;
  title: string;
};

const INDEX_KEY = "zac:drafts:index";

const kindChip: Record<DraftKind, string> = {
  affiliation: "Affiliation",
  chapter: "Chapter",
  character: "Character",
  work: "Work",
  world: "World",
};

function readIndex(): DraftEntry[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(INDEX_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeIndex(entries: DraftEntry[]) {
  localStorage.setItem(INDEX_KEY, JSON.stringify(entries.sort((a, b) => b.savedAt - a.savedAt).slice(0, 24)));
  window.dispatchEvent(new Event("zac:drafts-changed"));
}

function fieldValue(form: HTMLFormElement, names: string[]) {
  for (const name of names) {
    const value = new FormData(form).get(name);
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

function restoreForm(form: HTMLFormElement, data: Record<string, string>) {
  Object.entries(data).forEach(([name, value]) => {
    const controls = form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(`[name="${CSS.escape(name)}"]`);
    controls.forEach((control) => {
      if (control instanceof HTMLInputElement && (control.type === "radio" || control.type === "checkbox")) {
        control.checked = control.value === value || value === "on";
      } else {
        control.value = value;
      }
      control.dispatchEvent(new Event("input", { bubbles: true }));
      control.dispatchEvent(new Event("change", { bubbles: true }));
    });
  });
}

export function DraftAutoSave({
  descriptionFields = ["description", "summary", "body"],
  kind,
  titleFields = ["title", "name"],
}: {
  descriptionFields?: string[];
  kind: DraftKind;
  titleFields?: string[];
}) {
  const t = useTranslations("drafts");
  const markerRef = useRef<HTMLSpanElement>(null);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const form = markerRef.current?.closest("form");
    if (!form) return;
    const draftKey = `zac:draft:${pathname}`;
    const draftParam = searchParams.get("draftKey");
    const targetKey = draftParam ? `zac:draft:${draftParam}` : draftKey;
    const raw = localStorage.getItem(targetKey);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as { data?: Record<string, string> };
        if (parsed.data) restoreForm(form, parsed.data);
      } catch {
        // Ignore broken local drafts so the form remains usable.
      }
    }

    let timer: number | undefined;
    const save = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        const data = Object.fromEntries(Array.from(new FormData(form).entries()).filter(([, value]) => typeof value === "string")) as Record<string, string>;
        const title = fieldValue(form, titleFields) || t("untitled");
        const description = fieldValue(form, descriptionFields) || t("savedDescription", { kind: t(`kind.${kind}`) });
        const entry: DraftEntry = {
          description,
          href: `${pathname}?draftKey=${encodeURIComponent(pathname)}`,
          key: draftKey,
          kind,
          savedAt: Date.now(),
          title,
        };
        localStorage.setItem(draftKey, JSON.stringify({ data, entry }));
        writeIndex([entry, ...readIndex().filter((item) => item.key !== draftKey)]);
      }, 450);
    };
    const clear = () => {
      localStorage.removeItem(draftKey);
      writeIndex(readIndex().filter((item) => item.key !== draftKey));
    };

    form.addEventListener("input", save);
    form.addEventListener("change", save);
    form.addEventListener("submit", clear);
    return () => {
      window.clearTimeout(timer);
      form.removeEventListener("input", save);
      form.removeEventListener("change", save);
      form.removeEventListener("submit", clear);
    };
  }, [descriptionFields, kind, pathname, searchParams, t, titleFields]);

  return <span aria-hidden="true" ref={markerRef} />;
}

export function WorkspaceDrafts() {
  const t = useTranslations("drafts");
  const [drafts, setDrafts] = useState<DraftEntry[]>([]);

  function formatAgo(value: number) {
    const minutes = Math.max(0, Math.floor((Date.now() - value) / 60000));
    if (minutes < 1) return t("justNow");
    if (minutes < 60) return t("minutesAgo", { count: minutes });
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return t("hoursAgo", { count: hours });
    return t("daysAgo", { count: Math.floor(hours / 24) });
  }

  useEffect(() => {
    const sync = () => setDrafts(readIndex());
    sync();
    window.addEventListener("zac:drafts-changed", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("zac:drafts-changed", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  if (!drafts.length) {
    return (
      <div className="grid min-h-[180px] place-items-center rounded-lg border border-dashed border-white/15 text-white/65">
        {t("empty")}
      </div>
    );
  }

  return (
    <div className="grid grid-flow-col auto-cols-[minmax(260px,320px)] gap-3.5 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" aria-label={t("ariaList")}>
      {drafts.map((draft) => (
        <Link className="grid min-h-[220px] gap-3 rounded-lg border border-white/15 bg-white/[0.055] p-[18px] text-left outline-none hover:border-[#E100FF]/50" href={draft.href} key={draft.key}>
          <div className="flex items-center justify-between gap-4">
            <Chip active>{kindChip[draft.kind]}</Chip>
            <span className="text-[13px] text-white/65">{formatAgo(draft.savedAt)}</span>
          </div>
          <h3 className="text-xl leading-tight font-black">{draft.title}</h3>
          <p className="line-clamp-3 leading-relaxed text-white/65">{draft.description}</p>
          <div className="flex flex-wrap gap-2">
            <Chip>{t(`kind.${draft.kind}`)}</Chip>
          </div>
        </Link>
      ))}
    </div>
  );
}

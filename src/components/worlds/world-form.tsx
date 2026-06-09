"use client";

import { useActionState, useRef } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import type { Visibility } from "@prisma/client";

import { DraftAutoSave } from "@/components/drafts/draft-autosave";
import type { WorldActionState } from "@/features/worlds/types";

type WorldFormProps = {
  action: (state: WorldActionState, formData: FormData) => Promise<WorldActionState>;
  cancelHref: string;
  initialValues?: {
    coverImageUrl?: string | null;
    description?: string | null;
    genre?: string | null;
    slug?: string;
    tags?: string[];
    title?: string;
    visibility?: Visibility;
  };
  submitLabel: string;
};

const inputClass =
  "min-h-[52px] w-full rounded-lg border border-white/15 bg-black/50 px-4 font-bold text-white outline-none transition focus:border-[#E100FF]/70 focus:ring-3 focus:ring-[#E100FF]/15";

export function WorldForm({
  action,
  cancelHref,
  initialValues,
  submitLabel,
}: WorldFormProps) {
  const t = useTranslations();
  const [state, formAction, pending] = useActionState(action, {});
  const descriptionRef = useRef<HTMLTextAreaElement>(null);

  function insertMarkdown(value: string) {
    const textarea = descriptionRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const before = textarea.value.slice(0, start);
    const after = textarea.value.slice(end);
    const prefix = before && !before.endsWith("\n") ? "\n" : "";
    const inserted = `${prefix}${value}`;
    textarea.setRangeText(inserted, start, end, "end");
    textarea.focus();
  }

  return (
    <form action={formAction} className="grid gap-6">
      <DraftAutoSave kind="world" />
      {state.error ? (
        <p className="rounded-lg border border-[#FF0040]/40 bg-[#FF0040]/10 px-4 py-3 font-black text-[#ff91ac]">
          {state.error}
        </p>
      ) : null}
      <div className="grid grid-cols-2 gap-[18px] max-md:grid-cols-1">
        <label className="grid gap-2 font-black text-white/90">
          {t("worlds.form.title")}
          <input
            className={inputClass}
            defaultValue={initialValues?.title}
            maxLength={120}
            name="title"
            placeholder={t("worlds.form.titlePlaceholder")}
            required
          />
        </label>
        <label className="grid gap-2 font-black text-white/90">
          {t("worlds.form.slug")}
          <input
            className={inputClass}
            defaultValue={initialValues?.slug}
            maxLength={160}
            name="slug"
            placeholder="moon-harbor"
            required
          />
        </label>
        <label className="grid gap-2 font-black text-white/90">
          {t("worlds.form.coverImageUrl")}
          <input
            className={inputClass}
            defaultValue={initialValues?.coverImageUrl ?? ""}
            name="coverImageUrl"
            placeholder="https://example.com/world-cover.jpg"
            type="url"
          />
        </label>
        <label className="grid gap-2 font-black text-white/90">
          {t("worlds.form.visibility")}
          <select
            className={inputClass}
            defaultValue={initialValues?.visibility ?? "PRIVATE"}
            name="visibility"
          >
            <option value="PRIVATE">PRIVATE</option>
            <option value="SHARED">SHARED</option>
            <option value="PUBLIC">PUBLIC</option>
          </select>
        </label>
        <label className="grid gap-2 font-black text-white/90">
          {t("worlds.form.genre")}
          <input
            className={inputClass}
            defaultValue={initialValues?.genre ?? ""}
            maxLength={80}
            name="genre"
            placeholder={t("worlds.form.genrePlaceholder")}
          />
        </label>
        <label className="grid gap-2 font-black text-white/90">
          {t("worlds.form.tags")}
          <input
            className={inputClass}
            defaultValue={initialValues?.tags?.map((tag) => `#${tag}`).join(" ")}
            name="tags"
            placeholder={t("worlds.form.tagsPlaceholder")}
          />
        </label>
        <div className="grid gap-3 md:col-span-2">
          <span className="font-black text-white/90">{t("worlds.form.description")}</span>
          <div className="flex flex-wrap gap-2" aria-label={t("worlds.form.markdownExamples")}>
            {[
              { label: t("markdown.heading"), value: `# ${t("markdown.heading")}` },
              { label: t("markdown.subheading"), value: `## ${t("markdown.subheading")}` },
              { label: t("markdown.list"), value: `- ${t("markdown.list")}` },
              { label: t("markdown.keyword"), value: `\`${t("markdown.keyword")}\`` },
            ].map((syntax) => (
              <button
                className="inline-flex min-h-8 items-center rounded-full border border-white/15 bg-white/[0.06] px-3 text-[13px] font-black text-white/80"
                key={syntax.value}
                onClick={() => insertMarkdown(syntax.value)}
                type="button"
              >
                {syntax.label}
              </button>
            ))}
          </div>
          <textarea
            aria-label={t("worlds.form.description")}
            className={`${inputClass} min-h-[300px] resize-y py-4 leading-[1.7]`}
            defaultValue={initialValues?.description ?? ""}
            name="description"
            placeholder={t("worlds.form.descriptionPlaceholder")}
            ref={descriptionRef}
          />
        </div>
      </div>
      <div className="flex flex-wrap justify-end gap-2.5">
        <Link
          className="inline-flex min-h-[42px] items-center justify-center rounded-lg border border-white/15 bg-white/[0.06] px-[18px] font-black"
          href={cancelHref}
        >
          {t("common.cancel")}
        </Link>
        <button
          className="inline-flex min-h-[42px] items-center justify-center rounded-lg border border-white/15 bg-gradient-to-br from-[#E100FF] to-[#FF0040] px-[18px] font-black shadow-[0_12px_30px_rgba(255,0,64,0.24)] disabled:opacity-60"
          disabled={pending}
          type="submit"
        >
          {pending ? t("common.saving") : submitLabel}
        </button>
      </div>
    </form>
  );
}

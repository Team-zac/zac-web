"use client";

import { useActionState, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import type { AffiliationType, Visibility } from "@prisma/client";

import { DraftAutoSave } from "@/components/drafts/draft-autosave";
import { Button, ButtonLink } from "@/components/ui/button";
import { EntityLabel } from "@/components/ui/entity-label";
import type { AffiliationActionState } from "@/features/affiliations/types";

type WorldOption = {
  affiliations: { description: string | null; id: string; name: string; type: string }[];
  description: string | null;
  id: string;
  title: string;
};
type InitialValues = {
  color?: string | null;
  description?: string | null;
  name?: string;
  parentId?: string | null;
  symbolImageUrl?: string | null;
  type?: AffiliationType;
  visibility?: Visibility;
  worldId?: string;
};
const inputClass = "min-h-[52px] w-full rounded-lg border border-white/15 bg-black/50 px-4 font-bold text-white outline-none focus:border-[#E100FF]/70 focus:ring-3 focus:ring-[#E100FF]/15";

export function AffiliationForm({
  action,
  cancelHref,
  initialValues,
  submitLabel,
  worlds,
  worldLocked,
}: {
  action: (state: AffiliationActionState, formData: FormData) => Promise<AffiliationActionState>;
  cancelHref: string;
  initialValues?: InitialValues;
  submitLabel: string;
  worlds: WorldOption[];
  worldLocked?: boolean;
}) {
  const t = useTranslations();
  const [state, formAction, pending] = useActionState(action, {});
  const [worldId, setWorldId] = useState(initialValues?.worldId ?? worlds[0]?.id ?? "");
  const [parentId, setParentId] = useState(initialValues?.parentId ?? "");
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const world = worlds.find((item) => item.id === worldId);
  function selectWorld(id: string) { setWorldId(id); setParentId(""); }
  function insertMarkdown(value: string) {
    const textarea = descriptionRef.current;
    if (!textarea) return;
    textarea.setRangeText(`${textarea.selectionStart ? "\n" : ""}${value}`, textarea.selectionStart, textarea.selectionEnd, "end");
    textarea.focus();
  }
  return (
    <form action={formAction} className="grid gap-6">
      <DraftAutoSave kind="affiliation" />
      <input name="worldId" type="hidden" value={worldId} />
      <input name="parentId" type="hidden" value={parentId} />
      {state.error ? <p className="rounded-lg border border-[#FF0040]/40 bg-[#FF0040]/10 px-4 py-3 font-black text-[#ff91ac]">{state.error}</p> : null}
      {!worldLocked ? (
        <section className="grid gap-3">
          <h2 className="text-lg font-black">{t("affiliations.form.worldSelect")}</h2>
          <div className="grid grid-flow-col auto-cols-[minmax(260px,320px)] gap-3.5 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {worlds.map((option) => <label className={`relative grid min-h-[180px] cursor-pointer gap-3 rounded-lg border bg-white/[0.055] p-[18px] ${worldId === option.id ? "border-[#E100FF]/55" : "border-white/15"}`} key={option.id}>
              <input checked={worldId === option.id} className="absolute top-4 right-4 h-[18px] w-[18px] accent-[#E100FF]" onChange={() => selectWorld(option.id)} type="radio" />
              <span className="w-fit rounded-full border border-[#E100FF]/45 bg-[#E100FF]/15 px-2.5 py-1 text-[13px] font-black"><EntityLabel name="world" /></span>
              <h3 className="text-xl font-black">{option.title}</h3>
              <p className="line-clamp-3 text-white/65">{option.description ?? t("affiliations.form.worldDescriptionEmpty")}</p>
            </label>)}
          </div>
        </section>
      ) : null}
      <div className="grid grid-cols-2 gap-[18px] max-md:grid-cols-1">
        <Field label={t("affiliations.form.name")}><input className={inputClass} defaultValue={initialValues?.name} name="name" placeholder={t("affiliations.form.namePlaceholder")} required /></Field>
        <Field label={t("affiliations.form.type")}><select className={inputClass} defaultValue={initialValues?.type ?? "OTHER"} name="type">{["ORGANIZATION","COUNTRY","FACTION","FAMILY","SCHOOL","GUILD","SPECIES","FORCE","OTHER"].map((type) => <option key={type}>{type}</option>)}</select></Field>
        <Field label={t("affiliations.form.symbolImageUrl")}><input className={inputClass} defaultValue={initialValues?.symbolImageUrl ?? ""} name="symbolImageUrl" placeholder="https://example.com/symbol.png" type="url" /></Field>
        <Field label={t("affiliations.form.color")}><input className={inputClass} defaultValue={initialValues?.color ?? ""} name="color" placeholder="#E100FF" /></Field>
        <Field label={t("affiliations.form.visibility")}><select className={inputClass} defaultValue={initialValues?.visibility ?? "SHARED"} name="visibility"><option>SHARED</option><option>PRIVATE</option><option>PUBLIC</option></select></Field>
        <div className="grid gap-3 md:col-span-2">
          <span className="font-black">{t("affiliations.form.description")}</span>
          <div className="flex flex-wrap gap-2">{[
            { label: t("markdown.heading"), value: `# ${t("markdown.heading")}` },
            { label: t("markdown.subheading"), value: `## ${t("markdown.subheading")}` },
            { label: t("markdown.list"), value: `- ${t("markdown.list")}` },
            { label: t("markdown.keyword"), value: `\`${t("markdown.keyword")}\`` },
          ].map((syntax) => <button className="rounded-full border border-white/15 bg-white/[0.06] px-3 py-1.5 text-[13px] font-black" key={syntax.value} onClick={() => insertMarkdown(syntax.value)} type="button">{syntax.label}</button>)}</div>
          <textarea aria-label={t("affiliations.form.descriptionAria")} className={`${inputClass} min-h-[260px] py-4 font-mono leading-[1.68]`} defaultValue={initialValues?.description ?? ""} name="description" ref={descriptionRef} />
        </div>
        <section className="grid gap-3 md:col-span-2">
          <h2 className="text-lg font-black">{t("affiliations.form.parent")}</h2>
          <div className="grid grid-flow-col auto-cols-[minmax(260px,320px)] gap-3.5 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <label className={`relative grid min-h-[180px] cursor-pointer gap-3 rounded-lg border bg-white/[0.055] p-[18px] ${!parentId ? "border-[#E100FF]/55" : "border-white/15"}`}>
              <input checked={!parentId} className="absolute top-4 right-4 h-[18px] w-[18px] accent-[#E100FF]" onChange={() => setParentId("")} type="radio" />
              <span className="w-fit rounded-full border border-[#E100FF]/45 bg-[#E100FF]/15 px-2.5 py-1 text-[13px] font-black">{t("affiliations.form.none")}</span>
              <h3 className="text-xl font-black">{t("affiliations.form.root")}</h3>
              <p className="text-white/65">{t("affiliations.form.independentDescription")}</p>
            </label>
            {world?.affiliations.map((affiliation) => <label className={`relative grid min-h-[180px] cursor-pointer gap-3 rounded-lg border bg-white/[0.055] p-[18px] ${parentId === affiliation.id ? "border-[#E100FF]/55" : "border-white/15"}`} key={affiliation.id}>
              <input checked={parentId === affiliation.id} className="absolute top-4 right-4 h-[18px] w-[18px] accent-[#E100FF]" onChange={() => setParentId(affiliation.id)} type="radio" />
              <span className="w-fit rounded-full border border-white/15 px-2.5 py-1 text-[13px] font-black">{affiliation.type}</span>
              <h3 className="text-xl font-black">{affiliation.name}</h3>
              <p className="line-clamp-3 text-white/65">{affiliation.description ?? t("affiliations.form.descriptionEmpty")}</p>
            </label>)}
          </div>
        </section>
      </div>
      <div className="flex justify-end gap-2.5">
        <ButtonLink href={cancelHref}>{t("common.cancel")}</ButtonLink>
        <Button disabled={pending || !worldId} tone="primary" type="submit">
          {pending ? t("common.saving") : submitLabel}
        </Button>
      </div>
    </form>
  );
}
function Field({ children, label }: { children: React.ReactNode; label: string }) {
  return <label className="grid gap-2 font-black text-white/90">{label}{children}</label>;
}

"use client";

import { useActionState, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import type { CharacterAffiliationStatus, Visibility } from "@prisma/client";

import { DraftAutoSave } from "@/components/drafts/draft-autosave";
import { Button, ButtonLink } from "@/components/ui/button";
import { EntityLabel } from "@/components/ui/entity-label";
import type { CharacterActionState, CharacterAffiliationInput } from "@/features/characters/types";

type WorldOption = {
  affiliations: { color: string | null; description: string | null; id: string; name: string; type: string }[];
  description: string | null;
  id: string;
  tags: string[];
  title: string;
};

type InitialValues = {
  affiliations?: CharacterAffiliationInput[];
  alias?: string | null;
  background?: string | null;
  description?: string | null;
  name?: string;
  personality?: string | null;
  profileImageUrl?: string | null;
  summary?: string | null;
  tags?: string[];
  visibility?: Visibility;
  worldId?: string;
};

const inputClass = "min-h-[52px] w-full rounded-lg border border-white/15 bg-black/50 px-4 font-bold text-white outline-none focus:border-[#E100FF]/70 focus:ring-3 focus:ring-[#E100FF]/15";

export function CharacterForm({
  action,
  cancelHref,
  initialValues,
  submitLabel,
  worlds,
  worldLocked,
}: {
  action: (state: CharacterActionState, formData: FormData) => Promise<CharacterActionState>;
  cancelHref: string;
  initialValues?: InitialValues;
  submitLabel: string;
  worlds: WorldOption[];
  worldLocked?: boolean;
}) {
  const t = useTranslations();
  const [state, formAction, pending] = useActionState(action, {});
  const [worldId, setWorldId] = useState(initialValues?.worldId ?? worlds[0]?.id ?? "");
  const [connections, setConnections] = useState<CharacterAffiliationInput[]>(initialValues?.affiliations ?? []);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const world = worlds.find((item) => item.id === worldId);

  function selectWorld(id: string) {
    setWorldId(id);
    setConnections([]);
  }
  function toggleAffiliation(id: string) {
    setConnections((items) => items.some((item) => item.affiliationId === id)
      ? items.filter((item) => item.affiliationId !== id)
      : [...items, { affiliationId: id, endedLabel: "", isPrimary: items.length === 0, note: "", rank: "", startedLabel: "", status: "CURRENT", title: "" }]);
  }
  function updateConnection(id: string, patch: Partial<CharacterAffiliationInput>) {
    setConnections((items) => items.map((item) => item.affiliationId === id ? { ...item, ...patch } : patch.isPrimary ? { ...item, isPrimary: false } : item));
  }
  function insertMarkdown(value: string) {
    const textarea = descriptionRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    textarea.setRangeText(`${start ? "\n" : ""}${value}`, start, textarea.selectionEnd, "end");
    textarea.focus();
  }

  return (
    <form action={formAction} className="grid gap-6">
      <DraftAutoSave descriptionFields={["description", "summary", "personality", "background"]} kind="character" titleFields={["name", "alias"]} />
      <input name="affiliations" type="hidden" value={JSON.stringify(connections)} />
      <input name="worldId" type="hidden" value={worldId} />
      {state.error ? <p className="rounded-lg border border-[#FF0040]/40 bg-[#FF0040]/10 px-4 py-3 font-black text-[#ff91ac]">{state.error}</p> : null}
      {!worldLocked ? (
        <section className="grid gap-3">
          <h2 className="text-lg font-black">{t("characters.form.worldSelect")}</h2>
          <div className="grid grid-flow-col auto-cols-[minmax(260px,320px)] gap-3.5 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {worlds.map((option) => (
              <label className={`relative grid min-h-[210px] cursor-pointer gap-3 rounded-lg border bg-white/[0.055] p-[18px] ${worldId === option.id ? "border-[#E100FF]/55" : "border-white/15"}`} key={option.id}>
                <input checked={worldId === option.id} className="absolute top-4 right-4 h-[18px] w-[18px] accent-[#E100FF]" name="selected-world" onChange={() => selectWorld(option.id)} type="radio" />
                <span className="w-fit rounded-full border border-[#E100FF]/45 bg-[#E100FF]/15 px-2.5 py-1 text-[13px] font-black"><EntityLabel name="world" /></span>
                <h3 className="text-xl font-black">{option.title}</h3>
                <p className="line-clamp-3 text-white/65">{option.description ?? t("characters.form.worldDescriptionEmpty")}</p>
                <div className="flex flex-wrap gap-2">{option.tags.slice(0, 3).map((tag) => <span className="rounded-full border border-white/15 px-2.5 py-1 text-[13px]" key={tag}>{tag}</span>)}</div>
              </label>
            ))}
          </div>
        </section>
      ) : null}
      <div className="grid grid-cols-2 gap-[18px] max-md:grid-cols-1">
        <Field label={t("characters.form.name")}><input className={inputClass} defaultValue={initialValues?.name} maxLength={120} name="name" placeholder={t("characters.form.namePlaceholder")} required /></Field>
        <Field label={t("characters.form.alias")}><input className={inputClass} defaultValue={initialValues?.alias ?? ""} name="alias" placeholder={t("characters.form.aliasPlaceholder")} /></Field>
        <Field label={t("characters.form.profileImageUrl")}><input className={inputClass} defaultValue={initialValues?.profileImageUrl ?? ""} name="profileImageUrl" placeholder="https://example.com/arin-profile.jpg" type="url" /></Field>
        <Field label={t("characters.form.summary")}><input className={inputClass} defaultValue={initialValues?.summary ?? ""} maxLength={255} name="summary" placeholder={t("characters.form.summaryPlaceholder")} /></Field>
        <Field label={t("characters.form.visibility")}><select className={inputClass} defaultValue={initialValues?.visibility ?? "PRIVATE"} name="visibility"><option>PRIVATE</option><option>SHARED</option><option>PUBLIC</option></select></Field>
        <Field label={t("characters.form.tags")}><input className={inputClass} defaultValue={initialValues?.tags?.map((tag) => `#${tag}`).join(" ")} name="tags" placeholder={t("characters.form.tagsPlaceholder")} /></Field>
        <Field label={t("characters.form.personality")}><textarea className={`${inputClass} min-h-32 py-4`} defaultValue={initialValues?.personality ?? ""} name="personality" /></Field>
        <Field label={t("characters.form.background")}><textarea className={`${inputClass} min-h-32 py-4`} defaultValue={initialValues?.background ?? ""} name="background" /></Field>
        <div className="grid gap-3 md:col-span-2">
          <span className="font-black text-white/90">{t("characters.form.description")}</span>
          <div className="flex flex-wrap gap-2">{[
            { label: t("markdown.heading"), value: `# ${t("markdown.heading")}` },
            { label: t("markdown.subheading"), value: `## ${t("markdown.subheading")}` },
            { label: t("markdown.list"), value: `- ${t("markdown.list")}` },
            { label: t("markdown.keyword"), value: `\`${t("markdown.keyword")}\`` },
          ].map((syntax) => <button className="rounded-full border border-white/15 bg-white/[0.06] px-3 py-1.5 text-[13px] font-black" key={syntax.value} onClick={() => insertMarkdown(syntax.value)} type="button">{syntax.label}</button>)}</div>
          <textarea aria-label={t("characters.form.descriptionAria")} className={`${inputClass} min-h-[260px] resize-y py-4 font-mono leading-[1.68]`} defaultValue={initialValues?.description ?? ""} name="description" ref={descriptionRef} />
        </div>
        <section className="grid gap-3 md:col-span-2">
          <h2 className="text-lg font-black">{t("characters.form.affiliations")}</h2>
          <label className="grid gap-2 font-black">{t("characters.form.selectedAffiliations")}<input className={inputClass} readOnly value={connections.map((connection) => world?.affiliations.find(({ id }) => id === connection.affiliationId)?.name).filter(Boolean).join(", ")} /></label>
          <div className="grid grid-flow-col auto-cols-[minmax(260px,320px)] gap-3.5 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {world?.affiliations.map((affiliation) => {
              const selected = connections.some(({ affiliationId }) => affiliationId === affiliation.id);
              return <label className={`relative grid min-h-[180px] cursor-pointer gap-3 rounded-lg border bg-white/[0.055] p-[18px] ${selected ? "border-[#E100FF]/55" : "border-white/15"}`} key={affiliation.id}>
                <input checked={selected} className="absolute top-4 right-4 h-[18px] w-[18px] accent-[#E100FF]" onChange={() => toggleAffiliation(affiliation.id)} type="checkbox" />
                <span className="w-fit rounded-full border border-white/15 px-2.5 py-1 text-[13px] font-black">{affiliation.type}</span>
                <h3 className="text-xl font-black">{affiliation.name}</h3>
                <p className="line-clamp-3 text-white/65">{affiliation.description ?? t("characters.form.affiliationDescriptionEmpty")}</p>
              </label>;
            })}
          </div>
          {connections.map((connection) => {
            const affiliation = world?.affiliations.find(({ id }) => id === connection.affiliationId);
            return <article className="grid gap-3 rounded-lg border border-white/15 bg-black/25 p-4" key={connection.affiliationId}>
              <div className="flex items-center justify-between"><h3 className="text-xl font-black">{affiliation?.name}</h3><label className="flex items-center gap-2"><input checked={connection.isPrimary} className="h-4 w-4 accent-[#E100FF]" name="primary-affiliation" onChange={() => updateConnection(connection.affiliationId, { isPrimary: true })} type="radio" />{t("characters.form.primaryAffiliation")}</label></div>
              <div className="grid grid-cols-3 gap-3 max-md:grid-cols-1">
                <Field label={t("characters.form.title")}><input className={inputClass} onChange={(event) => updateConnection(connection.affiliationId, { title: event.target.value })} value={connection.title} /></Field>
                <Field label={t("characters.form.rank")}><input className={inputClass} onChange={(event) => updateConnection(connection.affiliationId, { rank: event.target.value })} value={connection.rank} /></Field>
                <Field label={t("characters.form.status")}><select className={inputClass} onChange={(event) => updateConnection(connection.affiliationId, { status: event.target.value as CharacterAffiliationStatus })} value={connection.status}><option>CURRENT</option><option>FORMER</option><option>UNKNOWN</option></select></Field>
                <Field label={t("characters.form.startedAt")}><input className={inputClass} onChange={(event) => updateConnection(connection.affiliationId, { startedLabel: event.target.value })} value={connection.startedLabel} /></Field>
                <Field label={t("characters.form.endedAt")}><input className={inputClass} onChange={(event) => updateConnection(connection.affiliationId, { endedLabel: event.target.value })} value={connection.endedLabel} /></Field>
                <Field label={t("characters.form.note")}><input className={inputClass} onChange={(event) => updateConnection(connection.affiliationId, { note: event.target.value })} value={connection.note} /></Field>
              </div>
            </article>;
          })}
        </section>
      </div>
      <div className="flex flex-wrap justify-end gap-2.5">
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

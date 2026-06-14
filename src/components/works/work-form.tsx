"use client";

import { useActionState, useRef, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import type { PublishStatus, Visibility, WorkCharacterRole, WorkType } from "@prisma/client";

import { DraftAutoSave } from "@/components/drafts/draft-autosave";
import { Button, ButtonLink } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import type { WorkActionState, WorkAffiliationInput, WorkCharacterInput } from "@/features/works/types";

type WorldOption = {
  affiliations: { description: string | null; id: string; name: string; type: string }[];
  characters: { alias: string | null; id: string; name: string; summary: string | null }[];
  id: string;
  title: string;
};

type InitialValues = {
  affiliations?: WorkAffiliationInput[];
  characters?: WorkCharacterInput[];
  coverImageUrl?: string | null;
  description?: string | null;
  isOfficial?: boolean;
  publishStatus?: PublishStatus;
  tags?: string[];
  title?: string;
  type?: WorkType;
  visibility?: Visibility;
  worldId?: string;
};

const inputClass = "min-h-[52px] w-full rounded-lg border border-white/15 bg-black/50 px-4 font-bold text-white outline-none focus:border-[#E100FF]/70 focus:ring-3 focus:ring-[#E100FF]/15";

export function WorkForm({
  action,
  cancelHref,
  initialValues,
  submitLabel,
  worlds,
  worldLocked,
}: {
  action: (state: WorkActionState, formData: FormData) => Promise<WorkActionState>;
  cancelHref: string;
  initialValues?: InitialValues;
  submitLabel: string;
  worlds: WorldOption[];
  worldLocked?: boolean;
}) {
  const t = useTranslations();
  const roleLabels: Record<WorkCharacterRole, string> = {
    MAIN: t("works.form.roles.main"),
    MENTIONED: t("works.form.roles.mentioned"),
    OTHER: t("works.form.roles.other"),
    POV: t("works.form.roles.pov"),
    SUPPORTING: t("works.form.roles.supporting"),
  };
  const [state, formAction, pending] = useActionState(action, {});
  const [worldId, setWorldId] = useState(initialValues?.worldId ?? worlds[0]?.id ?? "");
  const [characters, setCharacters] = useState<WorkCharacterInput[]>(initialValues?.characters ?? []);
  const [affiliations, setAffiliations] = useState<WorkAffiliationInput[]>(initialValues?.affiliations ?? []);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const world = worlds.find((item) => item.id === worldId);

  function selectWorld(id: string) {
    setWorldId(id);
    setCharacters([]);
    setAffiliations([]);
  }
  function toggleCharacter(characterId: string) {
    setCharacters((items) => items.some((item) => item.characterId === characterId)
      ? items.filter((item) => item.characterId !== characterId)
      : [...items, { characterId, note: "", role: "SUPPORTING" }]);
  }
  function updateCharacter(characterId: string, patch: Partial<WorkCharacterInput>) {
    setCharacters((items) => items.map((item) => item.characterId === characterId ? { ...item, ...patch } : item));
  }
  function toggleAffiliation(affiliationId: string) {
    setAffiliations((items) => items.some((item) => item.affiliationId === affiliationId)
      ? items.filter((item) => item.affiliationId !== affiliationId)
      : [...items, { affiliationId, note: "" }]);
  }
  function updateAffiliation(affiliationId: string, patch: Partial<WorkAffiliationInput>) {
    setAffiliations((items) => items.map((item) => item.affiliationId === affiliationId ? { ...item, ...patch } : item));
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
      <DraftAutoSave kind="work" />
      <input name="characters" type="hidden" value={JSON.stringify(characters)} />
      <input name="affiliations" type="hidden" value={JSON.stringify(affiliations)} />
      <input name="worldId" type="hidden" value={worldId} />
      {state.error ? <p className="rounded-lg border border-[#FF0040]/40 bg-[#FF0040]/10 px-4 py-3 font-black text-[#ff91ac]">{state.error}</p> : null}
      <div className="grid grid-cols-2 gap-[18px] max-md:grid-cols-1">
        {!worldLocked ? (
          <Field label={t("works.form.worldLink")}>
            <select className={inputClass} onChange={(event) => selectWorld(event.target.value)} value={worldId}>
              {worlds.map((option) => <option key={option.id} value={option.id}>{option.title}</option>)}
            </select>
          </Field>
        ) : null}
        <Field label={t("works.form.title")}>
          <input className={inputClass} defaultValue={initialValues?.title ?? ""} maxLength={160} name="title" placeholder={t("works.form.titlePlaceholder")} required />
        </Field>
        <Field label={t("works.form.type")}>
          <select className={inputClass} defaultValue={initialValues?.type ?? "NOVEL"} name="type">
            <option value="NOVEL">{t("cards.workTypes.novel")}</option>
            <option value="ROLEPLAY">{t("cards.workTypes.roleplay")}</option>
            <option value="SETTING_NOTE">{t("cards.workTypes.settingNote")}</option>
            <option value="SHORT_STORY">{t("cards.workTypes.shortStory")}</option>
            <option value="EPISODE">{t("cards.workTypes.episode")}</option>
            <option value="OTHER">{t("cards.workTypes.other")}</option>
          </select>
        </Field>
        <Field label={t("works.form.coverImageUrl")}>
          <input className={inputClass} defaultValue={initialValues?.coverImageUrl ?? ""} name="coverImageUrl" placeholder="https://example.com/work-cover.jpg" type="url" />
        </Field>
        <Field label={t("works.form.visibility")}>
          <select className={inputClass} defaultValue={initialValues?.visibility ?? "PRIVATE"} name="visibility">
            <option>PRIVATE</option><option>SHARED</option><option>PUBLIC</option>
          </select>
        </Field>
        <Field label={t("works.form.publishStatus")}>
          <select className={inputClass} defaultValue={initialValues?.publishStatus ?? "DRAFT"} name="publishStatus">
            <option>DRAFT</option><option>PUBLISHED</option><option>ARCHIVED</option>
          </select>
        </Field>
        <Field label={t("works.form.officialLabel")}>
          <select className={inputClass} defaultValue={initialValues?.isOfficial ? "true" : "false"} name="isOfficial">
            <option value="true">{t("works.form.official")}</option>
            <option value="false">{t("works.form.unofficial")}</option>
          </select>
        </Field>
        <Field label={t("works.form.tags")}>
          <input className={inputClass} defaultValue={initialValues?.tags?.map((tag) => `#${tag}`).join(" ")} name="tags" placeholder={t("works.form.tagsPlaceholder")} />
        </Field>
        <section className="grid gap-3 md:col-span-2">
          <span className="font-black text-white/90">{t("works.form.description")}</span>
          <div className="flex flex-wrap gap-2">
            {[
              { label: t("markdown.heading"), value: `# ${t("markdown.heading")}` },
              { label: t("markdown.subheading"), value: `## ${t("markdown.subheading")}` },
              { label: t("markdown.list"), value: `- ${t("markdown.list")}` },
              { label: t("markdown.keyword"), value: `\`${t("markdown.keyword")}\`` },
            ].map((syntax) => (
              <button className="rounded-full border border-white/15 bg-white/[0.06] px-3 py-1.5 text-[13px] font-black" key={syntax.value} onClick={() => insertMarkdown(syntax.value)} type="button">
                {syntax.label}
              </button>
            ))}
          </div>
          <textarea aria-label={t("works.form.descriptionAria")} className={`${inputClass} min-h-[280px] resize-y py-4 font-mono leading-[1.68]`} defaultValue={initialValues?.description ?? ""} name="description" ref={descriptionRef} />
        </section>
        <section className="grid gap-3 md:col-span-2">
          <h2 className="text-lg font-black">{t("works.form.characterLink")}</h2>
          <label className="grid gap-2 font-black">
            {t("works.form.selectedCharacters")}
            <input className={inputClass} readOnly value={characters.map((connection) => world?.characters.find(({ id }) => id === connection.characterId)?.name).filter(Boolean).join(", ")} />
          </label>
          <div className="grid grid-flow-col auto-cols-[minmax(260px,320px)] gap-3.5 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {world?.characters.map((character) => {
              const selected = characters.some(({ characterId }) => characterId === character.id);
              return (
                <label className={`relative grid min-h-[170px] cursor-pointer gap-3 rounded-lg border bg-white/[0.055] p-[18px] ${selected ? "border-[#E100FF]/55" : "border-white/15"}`} key={character.id}>
                  <input checked={selected} className="absolute top-4 right-4 h-[18px] w-[18px] accent-[#E100FF]" onChange={() => toggleCharacter(character.id)} type="checkbox" />
                  <Chip active={selected}>{character.alias ?? "Character"}</Chip>
                  <h3 className="text-xl font-black">{character.name}</h3>
                  <p className="line-clamp-2 text-white/65">{character.summary ?? t("works.form.characterDescriptionEmpty")}</p>
                </label>
              );
            })}
          </div>
          {characters.map((connection) => {
            const character = world?.characters.find(({ id }) => id === connection.characterId);
            return (
              <article className="grid gap-3 rounded-lg border border-white/15 bg-black/25 p-4" key={connection.characterId}>
                <h3 className="text-xl font-black">{character?.name}</h3>
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(roleLabels) as WorkCharacterRole[]).map((role) => (
                    <button className={`rounded-full border px-3 py-1.5 text-[13px] font-black ${connection.role === role ? "border-[#E100FF]/55 bg-[#E100FF]/20" : "border-white/15 bg-white/[0.06]"}`} key={role} onClick={() => updateCharacter(connection.characterId, { role })} type="button">
                      {roleLabels[role]}
                    </button>
                  ))}
                </div>
                <input className={inputClass} onChange={(event) => updateCharacter(connection.characterId, { note: event.target.value })} placeholder={t("works.form.characterNote")} value={connection.note} />
              </article>
            );
          })}
        </section>
        <section className="grid gap-3 md:col-span-2">
          <h2 className="text-lg font-black">{t("works.form.affiliationLink")}</h2>
          <label className="grid gap-2 font-black">
            {t("works.form.selectedAffiliations")}
            <input className={inputClass} readOnly value={affiliations.map((connection) => world?.affiliations.find(({ id }) => id === connection.affiliationId)?.name).filter(Boolean).join(", ")} />
          </label>
          <div className="grid grid-flow-col auto-cols-[minmax(260px,320px)] gap-3.5 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {world?.affiliations.map((affiliation) => {
              const selected = affiliations.some(({ affiliationId }) => affiliationId === affiliation.id);
              return (
                <label className={`relative grid min-h-[170px] cursor-pointer gap-3 rounded-lg border bg-white/[0.055] p-[18px] ${selected ? "border-[#E100FF]/55" : "border-white/15"}`} key={affiliation.id}>
                  <input checked={selected} className="absolute top-4 right-4 h-[18px] w-[18px] accent-[#E100FF]" onChange={() => toggleAffiliation(affiliation.id)} type="checkbox" />
                  <Chip active={selected}>{affiliation.type}</Chip>
                  <h3 className="text-xl font-black">{affiliation.name}</h3>
                  <p className="line-clamp-2 text-white/65">{affiliation.description ?? t("works.form.affiliationDescriptionEmpty")}</p>
                </label>
              );
            })}
          </div>
          {affiliations.map((connection) => {
            const affiliation = world?.affiliations.find(({ id }) => id === connection.affiliationId);
            return (
              <article className="grid gap-3 rounded-lg border border-white/15 bg-black/25 p-4" key={connection.affiliationId}>
                <h3 className="text-xl font-black">{affiliation?.name}</h3>
                <input className={inputClass} onChange={(event) => updateAffiliation(connection.affiliationId, { note: event.target.value })} placeholder={t("works.form.affiliationNote")} value={connection.note} />
              </article>
            );
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

function Field({ children, label }: { children: ReactNode; label: string }) {
  return <label className="grid gap-2 font-black text-white/90">{label}{children}</label>;
}

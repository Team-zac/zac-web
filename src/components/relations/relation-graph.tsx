"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import { Button, ButtonLink } from "@/components/ui/button";
import { Panel } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { EntityLabel } from "@/components/ui/entity-label";
import { BackButton } from "@/components/ui/back-button";
import type { RelationActionState, RelationEdge, RelationGraphData } from "@/features/relations/types";

type RelationGraphProps = {
  data: RelationGraphData;
  compact?: boolean;
  showHero?: boolean;
};

const inputClass =
  "min-h-[52px] w-full rounded-lg border border-white/15 bg-black/50 px-4 font-bold text-white outline-none focus:border-[#E100FF]/70 focus:ring-3 focus:ring-[#E100FF]/15 disabled:opacity-70";

const directionOptions = ["DIRECTED", "BIDIRECTIONAL"] as const;
const statusOptions = ["ACTIVE", "PAST", "RUMORED", "ENDED", "UNKNOWN"] as const;
const visibilityOptions = ["PRIVATE", "SHARED", "PUBLIC"] as const;

export function RelationGraph({ compact, data, showHero }: RelationGraphProps) {
  const t = useTranslations("relations");
  const router = useRouter();
  const canvasRef = useRef<HTMLDivElement>(null);
  const pointerRef = useRef({ active: false, left: 0, top: 0, x: 0, y: 0 });
  const selectedFormRef = useRef<HTMLFormElement>(null);
  const createFormRef = useRef<HTMLFormElement>(null);
  const [createState, setCreateState] = useState<RelationActionState>({});
  const [createPending, startCreate] = useTransition();
  const [selectedRelation, setSelectedRelation] = useState<RelationEdge | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [mutationState, setMutationState] = useState<RelationActionState>({});
  const [mutationPending, startMutation] = useTransition();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.scrollLeft = Math.max(0, (canvas.scrollWidth - canvas.clientWidth) / 2);
    canvas.scrollTop = Math.max(0, (canvas.scrollHeight - canvas.clientHeight) / 2);
  }, [data.world.id]);

  useEffect(() => {
    if (!showHero || window.location.hash !== "#new" || !data.canEdit) return;
    setAddOpen(true);
  }, [data.canEdit, showHero]);

  function closeSelected() {
    setSelectedRelation(null);
    setMutationState({});
  }

  function updateSelected() {
    if (!selectedRelation || !selectedFormRef.current) return;
    const formData = new FormData(selectedFormRef.current);
    startMutation(async () => {
      const response = await fetch(`/api/relations/${selectedRelation.id}`, { body: formData, method: "PATCH" });
      const result = response.ok ? { ok: true } : { error: (await response.json()).error ?? t("requestFailed") };
      setMutationState(result);
      if (result.ok) {
        closeSelected();
        router.refresh();
      }
    });
  }

  function deleteSelected() {
    if (!selectedRelation) return;
    startMutation(async () => {
      const response = await fetch(`/api/relations/${selectedRelation.id}`, { method: "DELETE" });
      const result = response.ok ? { ok: true } : { error: (await response.json()).error ?? t("requestFailed") };
      setMutationState(result);
      if (result.ok) {
        closeSelected();
        router.refresh();
      }
    });
  }

  return (
    <>
      {showHero ? (
        <section className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-6 border-b border-white/15 pb-7 max-md:grid-cols-1">
          <div>
            <BackButton />
            <p className="mb-3 inline-flex rounded-full border border-[#E100FF]/35 bg-[#E100FF]/10 px-2.5 py-1 text-xs font-black uppercase">
              <EntityLabel name="graph" />
            </p>
            <h1 className="text-4xl leading-tight font-black">{t("title")}</h1>
            <p className="mt-3 max-w-[680px] text-white/65">
              {t("description")}
            </p>
          </div>
          {data.canEdit ? (
            <Button onClick={() => setAddOpen(true)} tone="primary" type="button">
              {t("add")}
            </Button>
          ) : null}
        </section>
      ) : null}

      <Panel>
        <div className="mb-4 flex items-center justify-between gap-3.5 max-md:flex-col max-md:items-start">
          <h2 className="text-[28px] leading-tight font-black">{t("graph")}</h2>
          {compact ? (
            <ButtonLink className="!min-h-[38px] !px-4" href={`/relations?worldId=${data.world.id}`}>
              {t("view")}
            </ButtonLink>
          ) : (
            <Chip active={data.canEdit}>{data.canEdit ? t("editable") : t("readOnly")}</Chip>
          )}
        </div>
        <div
          aria-label={t("graphAria")}
          className={[
            "relative w-full cursor-grab touch-none overflow-auto rounded-lg border border-white/15 bg-[radial-gradient(circle_at_28%_24%,rgba(225,0,255,0.24),transparent_22%),radial-gradient(circle_at_72%_76%,rgba(255,0,64,0.22),transparent_24%),rgba(255,255,255,0.045)] select-none active:cursor-grabbing [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
            compact ? "h-[460px]" : "h-[520px]",
          ].join(" ")}
          onPointerCancel={(event) => {
            pointerRef.current.active = false;
            if (event.currentTarget.hasPointerCapture(event.pointerId)) {
              event.currentTarget.releasePointerCapture(event.pointerId);
            }
          }}
          onPointerDown={(event) => {
            if ((event.target as Element).closest("button, a, input, select")) return;
            pointerRef.current = {
              active: true,
              left: event.currentTarget.scrollLeft,
              top: event.currentTarget.scrollTop,
              x: event.clientX,
              y: event.clientY,
            };
            event.currentTarget.setPointerCapture(event.pointerId);
          }}
          onPointerMove={(event) => {
            const pointer = pointerRef.current;
            if (!pointer.active) return;
            event.preventDefault();
            event.currentTarget.scrollLeft = pointer.left - (event.clientX - pointer.x);
            event.currentTarget.scrollTop = pointer.top - (event.clientY - pointer.y);
          }}
          onPointerUp={(event) => {
            pointerRef.current.active = false;
            if (event.currentTarget.hasPointerCapture(event.pointerId)) {
              event.currentTarget.releasePointerCapture(event.pointerId);
            }
          }}
          ref={canvasRef}
        >
          <div className="relative h-[760px] w-[1120px]">
            {data.edges.map((edge) => (
              <button
                aria-label={t("selectEdgeAria", { source: edge.sourceName, target: edge.targetName })}
                className="absolute z-[1] h-6 origin-left border-0 bg-transparent p-0 text-white outline-none before:absolute before:top-1/2 before:right-0 before:left-0 before:h-0.5 before:-translate-y-1/2 before:rounded-full before:bg-gradient-to-r before:from-[#E100FF] before:to-[#FF0040] before:content-[''] hover:before:h-1 focus-visible:ring-3 focus-visible:ring-[#E100FF]/45"
                key={edge.id}
                onClick={() => setSelectedRelation(edge)}
                style={{
                  left: edge.x,
                  top: edge.y,
                  transform: `rotate(${edge.rotate}deg)`,
                  width: edge.width,
                }}
                type="button"
              />
            ))}
            {data.nodes.map((node) => (
              <div
                className="absolute z-[2] grid min-h-20 w-36 gap-1 rounded-lg border bg-black/75 p-3 shadow-[0_18px_40px_rgba(0,0,0,0.34)]"
                key={node.id}
                style={{
                  borderColor: node.affiliationColor ? `${node.affiliationColor}99` : "rgba(255,255,255,0.14)",
                  left: node.left,
                  top: node.top,
                }}
              >
                <strong>{node.name}</strong>
                <span className="text-[13px] text-white/65">{node.affiliationName ?? t("noAffiliation")}</span>
              </div>
            ))}
            {!data.nodes.length ? (
              <div className="absolute inset-0 grid place-items-center text-white/65">
                {t("registerCharacters")}
              </div>
            ) : null}
          </div>
        </div>
      </Panel>

      {selectedRelation ? (
        <RelationModal title={`${selectedRelation.sourceName} ↔ ${selectedRelation.targetName}`} onClose={closeSelected}>
          <form className="grid gap-3.5" ref={selectedFormRef}>
            <input name="worldId" type="hidden" value={data.world.id} />
            {mutationState.error ? <ErrorMessage>{mutationState.error}</ErrorMessage> : null}
            <Field label={t("name")}>
              <input
                className={inputClass}
                defaultValue={selectedRelation.name}
                disabled={!data.canEdit}
                name="name"
                required
              />
            </Field>
            <div className="grid grid-cols-2 gap-3.5 max-[515px]:grid-cols-1">
              <CharacterSelect defaultValue={selectedRelation.sourceCharacterId} disabled={!data.canEdit} emptyLabel={t("select")} label={t("sourceCharacter")} name="sourceCharacterId" options={data.characters} />
              <CharacterSelect defaultValue={selectedRelation.targetCharacterId} disabled={!data.canEdit} emptyLabel={t("select")} label={t("targetCharacter")} name="targetCharacterId" options={data.characters} />
            </div>
            <div className="grid grid-cols-2 gap-3.5 max-[515px]:grid-cols-1">
              <EnumSelect defaultValue={selectedRelation.status} disabled={!data.canEdit} getOptionLabel={(option) => t(`options.status.${option.toLowerCase()}`)} label={t("status")} name="status" options={statusOptions} />
              <EnumSelect defaultValue={selectedRelation.direction} disabled={!data.canEdit} getOptionLabel={(option) => t(`options.direction.${option.toLowerCase()}`)} label={t("direction")} name="direction" options={directionOptions} />
            </div>
            <div className="grid grid-cols-2 gap-3.5 max-[515px]:grid-cols-1">
              <EnumSelect defaultValue={selectedRelation.visibility} disabled={!data.canEdit} getOptionLabel={(option) => t(`options.visibility.${option.toLowerCase()}`)} label={t("visibility")} name="visibility" options={visibilityOptions} />
              <AffiliationSelect defaultValue={selectedRelation.contextAffiliationId ?? ""} disabled={!data.canEdit} emptyLabel={t("none")} label={t("contextAffiliation")} name="contextAffiliationId" options={data.affiliations} />
            </div>
            <Field label={t("descriptionLabel")}>
              <input
                className={inputClass}
                defaultValue={selectedRelation.description}
                disabled={!data.canEdit}
                name="description"
                placeholder={t("descriptionPlaceholder")}
              />
            </Field>
            {data.canEdit ? (
              <div className="grid grid-cols-2 gap-2.5">
                <Button className="w-full border-[#FF0040]/45 bg-[#FF0040]/10 text-[#ff8aa7]" disabled={mutationPending} onClick={deleteSelected} type="button">
                  {t("delete")}
                </Button>
                <Button className="w-full" disabled={mutationPending} onClick={updateSelected} tone="primary" type="button">
                  {mutationPending ? t("saving") : t("save")}
                </Button>
              </div>
            ) : null}
          </form>
        </RelationModal>
      ) : null}

      {addOpen ? (
        <RelationModal title={t("add")} onClose={() => setAddOpen(false)}>
          <form
            className="grid gap-3.5"
            ref={createFormRef}
            onSubmit={(event) => {
              event.preventDefault();
              const form = createFormRef.current;
              if (!form) return;
              startCreate(async () => {
                const response = await fetch("/api/relations", { body: new FormData(form), method: "POST" });
                if (!response.ok) {
                  const payload = await response.json();
                  setCreateState({ error: payload.error ?? t("requestFailed") });
                  return;
                }
                setCreateState({ ok: true });
                setAddOpen(false);
                router.refresh();
              });
            }}
          >
            <input name="worldId" type="hidden" value={data.world.id} />
            {createState.error ? <ErrorMessage>{createState.error}</ErrorMessage> : null}
            <Field label={t("name")}>
              <input className={inputClass} name="name" placeholder={t("namePlaceholder")} required />
            </Field>
            <div className="grid grid-cols-2 gap-3.5 max-[515px]:grid-cols-1">
              <CharacterSelect emptyLabel={t("select")} label={t("sourceCharacter")} name="sourceCharacterId" options={data.characters} />
              <CharacterSelect emptyLabel={t("select")} label={t("targetCharacter")} name="targetCharacterId" options={data.characters} />
            </div>
            <div className="grid grid-cols-2 gap-3.5 max-[515px]:grid-cols-1">
              <EnumSelect defaultValue="ACTIVE" getOptionLabel={(option) => t(`options.status.${option.toLowerCase()}`)} label={t("status")} name="status" options={statusOptions} />
              <EnumSelect defaultValue="DIRECTED" getOptionLabel={(option) => t(`options.direction.${option.toLowerCase()}`)} label={t("direction")} name="direction" options={directionOptions} />
            </div>
            <div className="grid grid-cols-2 gap-3.5 max-[515px]:grid-cols-1">
              <EnumSelect defaultValue="PRIVATE" getOptionLabel={(option) => t(`options.visibility.${option.toLowerCase()}`)} label={t("visibility")} name="visibility" options={visibilityOptions} />
              <AffiliationSelect emptyLabel={t("none")} label={t("contextAffiliation")} name="contextAffiliationId" options={data.affiliations} />
            </div>
            <Field label={t("descriptionLabel")}>
              <input className={inputClass} name="description" placeholder={t("descriptionPlaceholder")} />
            </Field>
            <Button disabled={createPending} tone="primary" type="submit">
              {createPending ? t("creating") : t("create")}
            </Button>
          </form>
        </RelationModal>
      ) : null}

      {data.canEdit && !compact && !showHero ? <AddRelationButton onClick={() => setAddOpen(true)} /> : null}
    </>
  );
}

export function AddRelationButton({ onClick }: { onClick: () => void }) {
  const t = useTranslations("relations");
  return (
    <button className="sr-only" data-open-add-relation onClick={onClick} type="button">
      {t("add")}
    </button>
  );
}

function RelationModal({
  children,
  onClose,
  title,
}: {
  children: React.ReactNode;
  onClose: () => void;
  title: string;
}) {
  const t = useTranslations("relations");
  return (
    <div
      aria-labelledby="relation-modal-title"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 px-5 pt-28 pb-5 max-[515px]:px-3.5 max-[515px]:pt-[92px] max-[515px]:pb-[92px]"
      onClick={onClose}
      role="dialog"
    >
      <article
        className="grid w-full max-w-[480px] gap-3.5 rounded-lg border border-white/15 bg-[#0a0a0e]/95 p-[22px] shadow-[0_28px_80px_rgba(0,0,0,0.5)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3.5">
          <h2 className="text-[28px] leading-tight font-black" id="relation-modal-title">
            {title}
          </h2>
          <Button onClick={onClose} type="button">
            {t("close")}
          </Button>
        </div>
        {children}
      </article>
    </div>
  );
}

function Field({ children, label }: { children: React.ReactNode; label: string }) {
  return <label className="grid gap-2 font-black text-white/90">{label}{children}</label>;
}

function ErrorMessage({ children }: { children: React.ReactNode }) {
  return <p className="rounded-lg border border-[#FF0040]/40 bg-[#FF0040]/10 px-4 py-3 font-black text-[#ff91ac]">{children}</p>;
}

function CharacterSelect({
  defaultValue,
  disabled,
  emptyLabel,
  label,
  name,
  options,
}: {
  defaultValue?: string;
  disabled?: boolean;
  emptyLabel: string;
  label: string;
  name: string;
  options: { id: string; name: string }[];
}) {
  return (
    <Field label={label}>
      <select className={inputClass} defaultValue={defaultValue} disabled={disabled} name={name} required>
        <option value="">{emptyLabel}</option>
        {options.map((option) => <option key={option.id} value={option.id}>{option.name}</option>)}
      </select>
    </Field>
  );
}

function AffiliationSelect({
  defaultValue,
  disabled,
  emptyLabel,
  label,
  name,
  options,
}: {
  defaultValue?: string;
  disabled?: boolean;
  emptyLabel: string;
  label: string;
  name: string;
  options: { id: string; name: string }[];
}) {
  return (
    <Field label={label}>
      <select className={inputClass} defaultValue={defaultValue ?? ""} disabled={disabled} name={name}>
        <option value="">{emptyLabel}</option>
        {options.map((option) => <option key={option.id} value={option.id}>{option.name}</option>)}
      </select>
    </Field>
  );
}

function EnumSelect<T extends string>({
  defaultValue,
  disabled,
  getOptionLabel,
  label,
  name,
  options,
}: {
  defaultValue?: T;
  disabled?: boolean;
  getOptionLabel: (option: T) => string;
  label: string;
  name: string;
  options: readonly T[];
}) {
  return (
    <Field label={label}>
      <select className={inputClass} defaultValue={defaultValue} disabled={disabled} name={name}>
        {options.map((option) => <option key={option} value={option}>{getOptionLabel(option)}</option>)}
      </select>
    </Field>
  );
}

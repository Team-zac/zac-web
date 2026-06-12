"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

import { CharacterCard } from "@/components/characters/character-card";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import type { CharacterCardData } from "@/features/characters/types";

export function CharacterListManager({ characters }: { characters: CharacterCardData[] }) {
  const t = useTranslations();
  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const reset = () => { setDeleteMode(false); setSelectedIds([]); setModalOpen(false); };
  const toggle = (id: string) => setSelectedIds((ids) => ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id]);

  return (
    <>
      <Panel>
        <div className="mb-4 flex items-center justify-between gap-3 max-md:flex-col max-md:items-start">
          <h2 className="text-[28px] font-black">{t("characters.list.section")}</h2>
          <div className="flex flex-wrap gap-2">
            <Chip active className="self-center !min-h-0 px-3 py-1 leading-none">{t("common.manage")}</Chip>
            {deleteMode ? (
              <Button className="min-h-[38px] px-4" onClick={reset} type="button">
                {t("common.cancel")}
              </Button>
            ) : null}
            <Button
              className="min-h-[38px] px-4 disabled:opacity-50"
              disabled={pending}
              onClick={() => deleteMode ? selectedIds.length && setModalOpen(true) : setDeleteMode(true)}
              tone="primary"
              type="button"
            >
              {deleteMode ? t("characters.list.deleteSelected") : t("common.delete")}
            </Button>
          </div>
        </div>
        {deleteMode ? <p className="mb-4 text-[13px] text-white/65">{selectedIds.length ? t("characters.list.selected", { count: selectedIds.length }) : t("common.selectCardsToDelete")}</p> : null}
        {characters.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {characters.map((character) => deleteMode ? (
              <button className="text-left" key={character.id} onClick={() => toggle(character.id)}>
                <CharacterCard character={character} selectable selected={selectedIds.includes(character.id)} />
              </button>
            ) : <CharacterCard character={character} key={character.id} />)}
          </div>
        ) : <div className="grid min-h-52 place-items-center rounded-lg border border-dashed border-white/15 text-white/65">{t("characters.list.empty")}</div>}
      </Panel>
      <ConfirmModal
        confirmDisabled={pending}
        confirmText={pending ? t("common.deleting") : t("common.confirm")}
        description={t("characters.list.deleteDescription")}
        onCancel={() => setModalOpen(false)}
        onConfirm={() => startTransition(async () => {
          await fetch("/api/characters", {
            body: JSON.stringify({ characterIds: selectedIds }),
            headers: { "content-type": "application/json" },
            method: "DELETE",
          });
          reset();
          router.refresh();
        })}
        open={modalOpen}
        title={t("common.confirmDelete")}
      />
    </>
  );
}

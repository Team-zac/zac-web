"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

import { WorldCard } from "@/components/worlds/world-card";
import type { WorldCardData } from "@/features/worlds/types";

export function WorldListManager({ worlds }: { worlds: WorldCardData[] }) {
  const t = useTranslations();
  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function reset() {
    setDeleteMode(false);
    setSelectedIds([]);
    setModalOpen(false);
  }

  function toggleSelected(worldId: string) {
    setSelectedIds((current) =>
      current.includes(worldId) ? current.filter((id) => id !== worldId) : [...current, worldId],
    );
  }

  function requestDelete() {
    if (!deleteMode) {
      setDeleteMode(true);
      return;
    }
    if (selectedIds.length) setModalOpen(true);
  }

  return (
    <>
      <article className="rounded-lg border border-white/15 bg-white/[0.055] p-[22px] shadow-[0_22px_54px_rgba(0,0,0,0.26)] backdrop-blur-xl">
        <div className="mb-4 flex items-center justify-between gap-3 max-md:flex-col max-md:items-start">
          <h2 className="text-[28px] font-black">{t("worlds.list.section")}</h2>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-[#E100FF]/35 bg-[#E100FF]/10 px-3 py-1 text-[13px] font-black">
              {t("common.manage")}
            </span>
            {deleteMode ? (
              <button
                className="min-h-[38px] rounded-lg border border-white/15 bg-white/[0.06] px-4 font-black"
                onClick={reset}
                type="button"
              >
                {t("common.cancel")}
              </button>
            ) : null}
            <button
              className="min-h-[38px] rounded-lg border border-white/15 bg-gradient-to-br from-[#E100FF] to-[#FF0040] px-4 font-black disabled:opacity-50"
              disabled={pending}
              onClick={requestDelete}
              type="button"
            >
              {deleteMode ? t("worlds.list.deleteSelected") : t("common.delete")}
            </button>
          </div>
        </div>
        {deleteMode ? (
          <p className="mb-4 text-[13px] font-bold text-white/65">
            {selectedIds.length
              ? t("worlds.list.selected", { count: selectedIds.length })
              : t("common.selectCardsToDelete")}
          </p>
        ) : null}
        {worlds.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {worlds.map((world) =>
              deleteMode ? (
                <button
                  aria-pressed={selectedIds.includes(world.id)}
                  className="text-left"
                  key={world.id}
                  onClick={() => toggleSelected(world.id)}
                  type="button"
                >
                  <WorldCard
                    selectable
                    selected={selectedIds.includes(world.id)}
                    world={world}
                  />
                </button>
              ) : (
                <WorldCard key={world.id} world={world} />
              ),
            )}
          </div>
        ) : (
          <div className="grid min-h-52 place-items-center rounded-lg border border-dashed border-white/15 text-center text-white/65">
            {t("worlds.list.empty")}
          </div>
        )}
      </article>

      {modalOpen ? (
        <div
          aria-labelledby="delete-confirm-title"
          aria-modal="true"
          className="fixed inset-0 z-[60] grid place-items-center bg-black/75 p-5"
          onClick={() => setModalOpen(false)}
          role="dialog"
        >
          <article
            className="grid w-full max-w-[440px] gap-4 rounded-lg border border-white/15 bg-[#0c0c0e] p-6 text-center shadow-[0_28px_80px_rgba(0,0,0,0.52)]"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 className="text-[28px] font-black" id="delete-confirm-title">
              {t("common.confirmDelete")}
            </h2>
            <p className="text-white/65">{t("worlds.list.deleteDescription")}</p>
            <div className="flex justify-center gap-2.5">
              <button
                className="min-h-[42px] rounded-lg border border-white/15 bg-white/[0.06] px-[18px] font-black"
                onClick={() => setModalOpen(false)}
                type="button"
              >
                {t("common.cancel")}
              </button>
              <button
                className="min-h-[42px] rounded-lg bg-gradient-to-br from-[#E100FF] to-[#FF0040] px-[18px] font-black disabled:opacity-50"
                disabled={pending}
                onClick={() =>
                  startTransition(async () => {
                    await fetch("/api/worlds", {
                      body: JSON.stringify({ worldIds: selectedIds }),
                      headers: { "content-type": "application/json" },
                      method: "DELETE",
                    });
                    reset();
                    router.refresh();
                  })
                }
                type="button"
              >
                {pending ? t("common.deleting") : t("common.confirm")}
              </button>
            </div>
          </article>
        </div>
      ) : null}
    </>
  );
}

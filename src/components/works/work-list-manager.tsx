"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

import { WorkCard } from "@/components/works/work-card";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import type { WorkCardData } from "@/features/works/types";

export function WorkListManager({ works }: { works: WorkCardData[] }) {
  const t = useTranslations();
  const [deleteMode, setDeleteMode] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const router = useRouter();
  const reset = () => { setDeleteMode(false); setModalOpen(false); setSelectedIds([]); };
  const toggle = (id: string) => setSelectedIds((ids) => ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id]);

  return (
    <>
      <Panel>
        <div className="mb-4 flex items-center justify-between gap-3 max-md:flex-col max-md:items-start">
          <h2 className="text-[28px] font-black">{t("works.list.section")}</h2>
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
              {deleteMode ? t("works.list.deleteSelected") : t("common.delete")}
            </Button>
          </div>
        </div>
        {deleteMode ? <p className="mb-4 text-[13px] text-white/65">{selectedIds.length ? t("works.list.selected", { count: selectedIds.length }) : t("common.selectCardsToDelete")}</p> : null}
        {works.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {works.map((work) => deleteMode ? (
              <button className="text-left" key={work.id} onClick={() => toggle(work.id)} type="button">
                <WorkCard selectable selected={selectedIds.includes(work.id)} work={work} />
              </button>
            ) : <WorkCard key={work.id} work={work} />)}
          </div>
        ) : (
          <div className="grid min-h-52 place-items-center rounded-lg border border-dashed border-white/15 text-white/65">
            {t("works.list.empty")}
          </div>
        )}
      </Panel>
      <ConfirmModal
        confirmDisabled={pending}
        confirmText={pending ? t("common.deleting") : t("common.confirm")}
        description={t("works.list.deleteDescription")}
        onCancel={() => setModalOpen(false)}
        onConfirm={() => startTransition(async () => {
          await fetch("/api/works", {
            body: JSON.stringify({ workIds: selectedIds }),
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

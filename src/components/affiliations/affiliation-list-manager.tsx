"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { ConfirmModal } from "@/components/ui/confirm-modal";

type Item = {
  _count: { characterAffiliations: number };
  color: string | null;
  id: string;
  name: string;
  parent: { name: string } | null;
  type: string;
  visibility: string;
  world: { title: string };
};

export function AffiliationListManager({ affiliations }: { affiliations: Item[] }) {
  const t = useTranslations();
  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const reset = () => { setDeleteMode(false); setSelectedIds([]); setModalOpen(false); };
  const toggle = (id: string) => setSelectedIds((ids) => ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id]);
  return <>
    <Panel>
      <div className="mb-4 flex items-center justify-between gap-3 max-md:flex-col max-md:items-start">
        <h2 className="text-[28px] font-black">{t("affiliations.list.section")}</h2>
        <div className="flex flex-wrap gap-2">
          <Chip active className="self-center !min-h-0 px-3 py-1 leading-none">{t("common.manage")}</Chip>
          {deleteMode ? (
            <Button className="min-h-[38px] px-4" onClick={reset} type="button">
              {t("common.cancel")}
            </Button>
          ) : null}
          <Button
            className="min-h-[38px] px-4"
            onClick={() => deleteMode ? selectedIds.length && setModalOpen(true) : setDeleteMode(true)}
            tone="primary"
            type="button"
          >
            {deleteMode ? t("affiliations.list.deleteSelected") : t("common.delete")}
          </Button>
        </div>
      </div>
      {deleteMode ? <p className="mb-4 text-[13px] text-white/65">{selectedIds.length ? t("affiliations.list.selected", { count: selectedIds.length }) : t("common.selectCardsToDelete")}</p> : null}
      {affiliations.length ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{affiliations.map((item) => {
        const card = <div className={`grid min-h-[220px] gap-3 rounded-lg border bg-white/[0.055] p-[18px] ${selectedIds.includes(item.id) ? "border-[#E100FF]/60" : "border-white/15"}`}>
          <div className="flex justify-between"><Chip active={selectedIds.includes(item.id)}>{item.type}</Chip><span className="text-[13px] text-white/65">{item.visibility.toLowerCase()}</span></div>
          <h3 className="text-xl font-black">{item.name}</h3>
          <p className="text-white/65">{t("affiliations.list.memberCount", { count: item._count.characterAffiliations, world: item.world.title })}</p>
          <div className="flex flex-wrap gap-2">{item.color ? <Chip>{item.color}</Chip> : null}<Chip>{item.parent?.name ?? t("affiliations.list.root")}</Chip></div>
        </div>;
        return deleteMode ? <button className="text-left" key={item.id} onClick={() => toggle(item.id)}>{card}</button> : <Link href={`/affiliations/${item.id}`} key={item.id}>{card}</Link>;
      })}</div> : <div className="grid min-h-52 place-items-center rounded-lg border border-dashed border-white/15 text-white/65">{t("affiliations.list.empty")}</div>}
    </Panel>
    <ConfirmModal
      confirmDisabled={pending}
      confirmText={pending ? t("common.deleting") : t("common.confirm")}
      description={t("affiliations.list.deleteDescription")}
      onCancel={() => setModalOpen(false)}
      onConfirm={() => startTransition(async () => {
        await fetch("/api/affiliations", {
          body: JSON.stringify({ affiliationIds: selectedIds }),
          headers: { "content-type": "application/json" },
          method: "DELETE",
        });
        reset();
        router.refresh();
      })}
      open={modalOpen}
      title={t("common.confirmDelete")}
    />
  </>;
}

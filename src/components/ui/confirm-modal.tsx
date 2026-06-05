"use client";

import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";

type ConfirmModalProps = {
  open?: boolean;
  title: string;
  description?: string;
  cancelText?: string;
  confirmText?: string;
  confirmDisabled?: boolean;
  onCancel?: () => void;
  onConfirm?: () => void;
  children?: ReactNode;
};

export function ConfirmModal({
  cancelText,
  children,
  confirmDisabled,
  confirmText,
  description,
  onCancel,
  onConfirm,
  open = false,
  title,
}: ConfirmModalProps) {
  const t = useTranslations("common");
  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[60] grid place-items-center bg-black/70 p-5"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
    >
      <div
        className="grid w-full max-w-[440px] gap-4 rounded-lg border border-white/15 bg-[#0c0c0e]/95 p-6 text-center"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 className="text-[28px] leading-tight font-black" id="confirm-title">
          {title}
        </h2>
        {description ? <p className="text-white/65">{description}</p> : null}
        {children}
        <div className="flex flex-wrap items-center justify-center gap-2.5">
          <Button onClick={onCancel} type="button">
            {cancelText ?? t("cancel")}
          </Button>
          <Button disabled={confirmDisabled} onClick={onConfirm} tone="primary" type="button">
            {confirmText ?? t("confirm")}
          </Button>
        </div>
      </div>
    </div>
  );
}

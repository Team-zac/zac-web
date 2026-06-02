"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { signOut } from "next-auth/react";
import { useTranslations } from "next-intl";

type LogoutConfirmButtonProps = {
  children?: ReactNode;
  className?: string;
  iconOnly?: boolean;
};

function LogoutIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      <path d="M10 17l5-5-5-5" />
      <path d="M15 12H3" />
      <path d="M12 4h7a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-7" />
    </svg>
  );
}

export function LogoutConfirmButton({
  children,
  className,
  iconOnly,
}: LogoutConfirmButtonProps) {
  const t = useTranslations("common");
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  async function confirmLogout() {
    setPending(true);
    await signOut({ callbackUrl: "/" });
  }

  const modal = open ? (
    <div
      className="fixed inset-0 z-[100] flex min-h-dvh items-center justify-center bg-black/75 px-5 py-8"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          setOpen(false);
        }
      }}
    >
      <section
        aria-labelledby="logout-confirm-title"
        aria-modal="true"
        className="w-full max-w-sm rounded-lg border border-white/15 bg-black/90 p-6 text-white shadow-[0_24px_70px_rgba(0,0,0,0.55)]"
        role="dialog"
      >
        <h2 className="text-2xl font-black" id="logout-confirm-title">
          {t("logout")}
        </h2>
        <p className="mt-3 text-white/70">{t("logoutConfirm")}</p>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            className="min-h-12 rounded-lg border border-white/15 bg-white/[0.08] px-4 font-black text-white disabled:opacity-60"
            disabled={pending}
            onClick={() => setOpen(false)}
            type="button"
          >
            {t("no")}
          </button>
          <button
            className="min-h-12 rounded-lg bg-gradient-to-br from-[#E100FF] to-[#FF0040] px-4 font-black text-white shadow-[0_12px_30px_rgba(255,0,64,0.24)] disabled:opacity-60"
            disabled={pending}
            onClick={confirmLogout}
            type="button"
          >
            {t("yes")}
          </button>
        </div>
      </section>
    </div>
  ) : null;

  return (
    <>
      <button
        aria-label={iconOnly ? t("logout") : undefined}
        className={className}
        onClick={() => setOpen(true)}
        type="button"
      >
        {children ?? (iconOnly ? <LogoutIcon /> : t("logout"))}
        {iconOnly ? <span className="sr-only">{t("logout")}</span> : null}
      </button>
      {mounted && modal ? createPortal(modal, document.body) : null}
    </>
  );
}

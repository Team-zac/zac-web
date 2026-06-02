"use client";

import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export function LoginForm() {
  const t = useTranslations("auth");
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");
  const [isSubmitting, setSubmitting] = useState(false);

  async function handleSubmit(formData: FormData) {
    setSubmitting(true);
    setError("");

    const result = await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
    });

    setSubmitting(false);

    if (result?.error) {
      setError(t("errors.invalidCredentials"));
      return;
    }

    router.push("/workspace");
    router.refresh();
  }

  return (
    <form action={handleSubmit} className="grid gap-[18px]">
      {searchParams.get("created") ? (
        <p className="rounded-lg border border-[#E100FF]/30 bg-[#E100FF]/10 px-3.5 py-3 font-extrabold text-white/80">
          {t("signupComplete")}
        </p>
      ) : null}
      {error ? (
        <p className="rounded-lg border border-[#FF0040]/40 bg-[#FF0040]/10 px-3.5 py-3 font-extrabold text-[#ff8aa7]">
          {error}
        </p>
      ) : null}

      <label className="grid gap-2 font-black text-white/90">
        <span>{t("email")}</span>
        <input
          className="min-h-[52px] w-full rounded-lg border border-white/15 bg-black/50 px-4 font-extrabold text-white outline-none focus:border-[#E100FF]/70"
          name="email"
          placeholder="creator@zac.app"
          required
          type="email"
        />
      </label>
      <label className="grid gap-2 font-black text-white/90">
        <span>{t("password")}</span>
        <input
          className="min-h-[52px] w-full rounded-lg border border-white/15 bg-black/50 px-4 font-extrabold text-white outline-none focus:border-[#E100FF]/70"
          name="password"
          placeholder={t("password")}
          required
          type="password"
        />
      </label>

      <button
        className="inline-flex min-h-[42px] w-full items-center justify-center rounded-lg border border-transparent bg-gradient-to-br from-[#E100FF] to-[#FF0040] px-[18px] font-black whitespace-nowrap text-white shadow-[0_12px_30px_rgba(255,0,64,0.24)] disabled:opacity-60"
        disabled={isSubmitting}
      >
        {isSubmitting ? t("loggingIn") : t("login")}
      </button>
    </form>
  );
}

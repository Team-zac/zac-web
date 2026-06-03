import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { PageShell } from "@/components/page-shell";
import { signUpAction } from "@/features/auth/actions";
import { createSeoMetadata } from "@/lib/seo";

export const metadata = createSeoMetadata({
  title: "회원가입",
  description: "Zac 계정을 만들어 세계관과 자작 캐릭터, 창작물을 관리할 수 있습니다.",
  path: "/signup",
});

type SignupPageProps = {
  searchParams?: Promise<{
    error?: string;
  }>;
};

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const t = await getTranslations("auth");
  const params = await searchParams;
  const error = params?.error === "invalid"
    ? t("errors.invalid")
    : params?.error === "exists"
      ? t("errors.exists")
      : "";

  return (
    <PageShell>
      <section className="mx-auto grid w-full max-w-[680px] justify-items-center gap-6">
        <h1 className="text-4xl leading-tight font-black">{t("signup")}</h1>
        <article className="grid w-full gap-[18px] rounded-lg border border-white/15 bg-white/[0.055] p-5 shadow-[0_22px_54px_rgba(0,0,0,0.26)] backdrop-blur-xl">
          <form action={signUpAction} className="grid gap-[18px]">
            {error ? (
              <p className="rounded-lg border border-[#FF0040]/40 bg-[#FF0040]/10 px-3.5 py-3 font-extrabold text-[#ff8aa7]">
                {error}
              </p>
            ) : null}

            <label className="grid gap-2 font-black text-white/90">
              <span>{t("name")}</span>
              <input
                className="min-h-[52px] w-full rounded-lg border border-white/15 bg-black/50 px-4 font-extrabold text-white outline-none focus:border-[#E100FF]/70"
                name="name"
                placeholder={t("namePlaceholder")}
                required
              />
            </label>
            <label className="grid gap-2 font-black text-white/90">
              <span>{t("email")}</span>
              <input
                className="min-h-[52px] w-full rounded-lg border border-white/15 bg-black/50 px-4 font-extrabold text-white outline-none focus:border-[#E100FF]/70"
                name="email"
                type="email"
                placeholder="creator@zac.app"
                required
              />
            </label>
            <label className="grid gap-2 font-black text-white/90">
              <span>{t("password")}</span>
              <input
                className="min-h-[52px] w-full rounded-lg border border-white/15 bg-black/50 px-4 font-extrabold text-white outline-none focus:border-[#E100FF]/70"
                name="password"
                type="password"
                placeholder={t("passwordPlaceholder")}
                required
              />
            </label>
            <label className="grid gap-2 font-black text-white/90">
              <span>{t("confirmPassword")}</span>
              <input
                className="min-h-[52px] w-full rounded-lg border border-white/15 bg-black/50 px-4 font-extrabold text-white outline-none focus:border-[#E100FF]/70"
                name="passwordConfirm"
                type="password"
                placeholder={t("passwordConfirmPlaceholder")}
                required
              />
            </label>

            <button className="inline-flex min-h-[42px] w-full items-center justify-center rounded-lg border border-transparent bg-gradient-to-br from-[#E100FF] to-[#FF0040] px-[18px] font-black whitespace-nowrap text-white shadow-[0_12px_30px_rgba(255,0,64,0.24)]">
              {t("signupAction")}
            </button>
          </form>
          <Link className="justify-self-center font-black text-white/65" href="/login">
            {t("login")}
          </Link>
        </article>
      </section>
    </PageShell>
  );
}

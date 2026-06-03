import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";

import { LoginForm } from "@/components/auth/login-form";
import { PageShell } from "@/components/page-shell";
import { createSeoMetadata } from "@/lib/seo";

export const metadata = createSeoMetadata({
  title: "로그인",
  description: "Zac 계정으로 로그인하여 세계관, 캐릭터, 창작물을 관리할 수 있습니다.",
  path: "/login",
});

export default async function LoginPage() {
  const t = await getTranslations("auth");
  return (
    <PageShell>
      <section className="mx-auto grid w-full max-w-[680px] justify-items-center gap-6">
        <h1 className="text-4xl leading-tight font-black">{t("login")}</h1>
        <article className="grid w-full gap-[18px] rounded-lg border border-white/15 bg-white/[0.055] p-5 shadow-[0_22px_54px_rgba(0,0,0,0.26)] backdrop-blur-xl">
          <Suspense fallback={<p className="text-white/65">{t("loadingLoginForm")}</p>}>
            <LoginForm />
          </Suspense>
          <Link className="justify-self-center font-black text-white/65" href="/signup">
            {t("signup")}
          </Link>
        </article>
      </section>
    </PageShell>
  );
}

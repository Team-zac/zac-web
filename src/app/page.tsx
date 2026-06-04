import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { PageShell } from "@/components/page-shell";
import { createSeoMetadata } from "@/lib/seo";

export const metadata = createSeoMetadata({
  title: "Zac 시작하기",
  description: "세계관, 캐릭터, 창작물을 한곳에서 만들고 관리하는 Zac의 시작 화면입니다.",
  path: "/",
});

export default async function Home() {
  const t = await getTranslations("home");
  return (
    <PageShell>
      <section
        className="relative grid min-h-[calc(100vh-208px)] place-items-center overflow-hidden px-5"
        aria-labelledby="home-title"
      >

        <div className="relative z-10 grid w-full max-w-[920px] justify-items-center gap-8 text-center">
          <h1 id="home-title" className="text-4xl md:text-5xl lg:text-[36px] font-extrabold leading-tight">
            {t("headline")}
          </h1>
          <Link
            className="inline-flex min-h-[52px] items-center justify-center rounded-lg border border-transparent bg-gradient-to-br from-[#E100FF] to-[#FF0040] px-[28px] font-black whitespace-nowrap text-white shadow-[0_18px_42px_rgba(255,0,64,0.34)]"
            href="/login"
          >
            {t("getStarted")}
          </Link>
        </div>
      </section>
    </PageShell>
  );
}

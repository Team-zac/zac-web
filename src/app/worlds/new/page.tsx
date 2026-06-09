import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { PageShell } from "@/components/page-shell";
import { EntityLabel } from "@/components/ui/entity-label";
import { BackButton } from "@/components/ui/back-button";
import { WorldForm } from "@/components/worlds/world-form";
import { createWorldAction } from "@/features/worlds/actions";
import { createSeoMetadata } from "@/lib/seo";
import { requireUser } from "@/server/permissions";

export const metadata = createSeoMetadata({
  title: "세계관 만들기",
  description: "새 세계관의 제목, 소개, 장르, 태그와 공개 범위를 입력해 생성하는 화면입니다.",
  path: "/worlds/new",
});

export default async function WorldCreatePage() {
  const t = await getTranslations("worlds.create");
  const user = await requireUser().catch(() => null);
  if (!user) redirect("/login");

  return (
    <PageShell activeKey="worlds">
      <section className="border-b border-white/15 pb-7">
        <BackButton />
        <p className="mb-3 inline-flex rounded-full border border-[#E100FF]/35 bg-[#E100FF]/10 px-2.5 py-1 text-xs font-black uppercase">
          <EntityLabel name="world" />
        </p>
        <h1 className="text-4xl leading-tight font-black">{t("title")}</h1>
        <p className="mt-3 max-w-[680px] text-white/65">
          {t("description")}
        </p>
      </section>
      <article className="rounded-lg border border-white/15 bg-white/[0.055] p-[22px] shadow-[0_22px_54px_rgba(0,0,0,0.26)]">
        <WorldForm
          action={createWorldAction}
          cancelHref="/worlds"
          submitLabel={t("submit")}
        />
      </article>
    </PageShell>
  );
}

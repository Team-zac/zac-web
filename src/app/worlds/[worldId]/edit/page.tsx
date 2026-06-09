import { notFound, redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { PageShell } from "@/components/page-shell";
import { EntityLabel } from "@/components/ui/entity-label";
import { BackButton } from "@/components/ui/back-button";
import { WorldForm } from "@/components/worlds/world-form";
import { updateWorldAction } from "@/features/worlds/actions";
import { getWorldForEdit } from "@/features/worlds/data";
import { createSeoMetadata } from "@/lib/seo";
import { requireUser } from "@/server/permissions";

export const metadata = createSeoMetadata({
  title: "세계관 수정",
  description: "세계관의 소개, 장르, 태그, 커버 이미지와 공개 범위를 수정하는 관리 화면입니다.",
});

type WorldEditPageProps = {
  params: Promise<{ worldId: string }>;
};

export default async function WorldEditPage({ params }: WorldEditPageProps) {
  const t = await getTranslations("worlds.edit");
  const { worldId } = await params;
  const user = await requireUser().catch(() => null);
  if (!user) redirect("/login");
  const world = await getWorldForEdit(worldId, user.id).catch(() => null);
  if (!world) notFound();

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
          action={updateWorldAction.bind(null, worldId)}
          cancelHref={`/worlds/${worldId}`}
          initialValues={{
            coverImageUrl: world.coverImageUrl,
            description: world.description,
            genre: world.genre,
            slug: world.slug,
            tags: world.worldTags.map(({ tag }) => tag.name),
            title: world.title,
            visibility: world.visibility,
          }}
          submitLabel={t("submit")}
        />
      </article>
    </PageShell>
  );
}

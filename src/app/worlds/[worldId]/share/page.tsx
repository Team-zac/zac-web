import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { notFound, redirect } from "next/navigation";

import { PageShell } from "@/components/page-shell";
import { EntityLabel } from "@/components/ui/entity-label";
import { BackButton } from "@/components/ui/back-button";
import { WorldShareManager } from "@/components/worlds/world-share-manager";
import { getWorldShareData } from "@/features/worlds/data";
import { createSeoMetadata } from "@/lib/seo";
import { requireUser } from "@/server/permissions";

export const metadata = createSeoMetadata({
  title: "세계관 공유 관리",
  description: "세계관 공동 작업자 초대, 권한 변경, 공유 해제를 관리하는 화면입니다.",
});

type WorldSharePageProps = {
  params: Promise<{ worldId: string }>;
};

export default async function WorldSharePage({ params }: WorldSharePageProps) {
  const t = await getTranslations("worlds.share");
  const { worldId } = await params;
  const user = await requireUser().catch(() => null);
  if (!user) redirect("/login");
  const world = await getWorldShareData(worldId, user.id).catch(() => null);
  if (!world) notFound();

  return (
    <PageShell activeKey="worlds">
      <section className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-6 border-b border-white/15 pb-7 max-md:grid-cols-1">
        <div>
          <BackButton />
          <p className="mb-3 inline-flex rounded-full border border-[#E100FF]/35 bg-[#E100FF]/10 px-2.5 py-1 text-xs font-black uppercase">
            <EntityLabel name="world" />
          </p>
          <h1 className="text-4xl leading-tight font-black">{t("title")}</h1>
          <p className="mt-3 max-w-[760px] text-white/65">
            {t("description", { title: world.title })}
          </p>
        </div>
        <Link
          className="inline-flex min-h-[42px] items-center justify-center rounded-lg border border-white/15 bg-white/[0.06] px-[18px] font-black"
          href={`/worlds/${worldId}`}
        >
          {t("detail")}
        </Link>
      </section>
      <WorldShareManager
        invites={world.invites.map((invite) => ({
          email: invite.email,
          id: invite.id,
          role: invite.role,
        }))}
        members={world.members}
        owner={world.owner}
        worldId={worldId}
      />
    </PageShell>
  );
}

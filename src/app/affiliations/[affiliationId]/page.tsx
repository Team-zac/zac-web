import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { PageShell } from "@/components/page-shell";
import { ButtonLink } from "@/components/ui/button";
import { Panel } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { MarkdownViewer } from "@/components/ui/markdown-viewer";
import { EntityLabel } from "@/components/ui/entity-label";
import { BackButton } from "@/components/ui/back-button";
import { getAffiliationDetail } from "@/features/affiliations/data";
import { createSeoMetadata } from "@/lib/seo";
import { resolveRemoteImageUrl } from "@/lib/remote-image";
import { getAuthSession } from "@/server/auth";
import { getWorldRole } from "@/server/permissions";

export async function generateMetadata({ params }: { params: Promise<{ affiliationId: string }> }) {
  const { affiliationId } = await params;
  const affiliation = await getAffiliationDetail(affiliationId).catch(() => null);
  const title = affiliation?.name ? `${affiliation.name} 소속` : "소속 상세";
  const description =
    affiliation?.description ??
    "세계관 내 소속의 정보, 상징, 상위 소속과 연결된 캐릭터 멤버를 확인하는 상세 화면입니다.";

  return createSeoMetadata({
    title,
    description,
    path: `/affiliations/${affiliationId}`,
  });
}

export default async function AffiliationDetailPage({ params }: { params: Promise<{ affiliationId: string }> }) {
  const [t, common] = await Promise.all([
    getTranslations("affiliations.detail"),
    getTranslations("common"),
  ]);
  const { affiliationId } = await params;
  const affiliation = await getAffiliationDetail(affiliationId).catch(() => null);
  if (!affiliation) notFound();
  const [session, symbolUrl] = await Promise.all([getAuthSession(), resolveRemoteImageUrl(affiliation.symbolImageUrl)]);
  const role = session?.user?.id ? await getWorldRole(affiliation.worldId, session.user.id) : null;
  const canEdit = affiliation.world.ownerId === session?.user?.id || role === "OWNER" || role === "ADMIN" || role === "EDITOR";
  return <PageShell activeKey="characters">
    <section className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-6 border-b border-white/15 pb-7 max-md:grid-cols-1"><div><BackButton /><p className="mb-3 inline-flex rounded-full border border-[#E100FF]/35 bg-[#E100FF]/10 px-2.5 py-1 text-xs font-black uppercase"><EntityLabel name="affiliation" /></p><h1 className="text-4xl font-black">{affiliation.name}</h1></div><div className="flex gap-2.5">{canEdit ? <ButtonLink href={`/affiliations/${affiliationId}/edit`} tone="primary">{common("edit")}</ButtonLink> : null}<ButtonLink href={`/worlds/${affiliation.worldId}`}>{t("world")}</ButtonLink></div></section>
    <Panel><h2 className="mb-5 text-[28px] font-black">{t("information")}</h2><div className="grid grid-cols-[minmax(220px,0.7fr)_minmax(0,1.3fr)] gap-4 max-md:grid-cols-1"><div className="grid gap-4"><div className="grid gap-4 rounded-lg border border-white/15 bg-black/25 p-[18px]"><h3 className="text-xl font-black">{t("symbol")}</h3><div className="relative aspect-[8/5] overflow-hidden rounded-lg border border-white/10 bg-black/40">{symbolUrl ? <Image alt={t("symbolAlt", { name: affiliation.name })} className="object-cover" fill sizes="(max-width: 768px) 100vw, 420px" src={symbolUrl} unoptimized /> : <div className="grid h-full place-items-center text-4xl font-black" style={{ color: affiliation.color ?? "#E100FF" }}>{affiliation.name.slice(0, 1)}</div>}</div><span className="text-[13px] text-white/65">{t("color")}</span><div className="flex items-center gap-2"><span className="h-6 w-6 rounded" style={{ backgroundColor: affiliation.color ?? "#E100FF" }} /><span>{affiliation.color ?? t("unspecified")}</span></div></div><div className="rounded-lg border border-white/15 bg-black/25 p-[18px]"><span className="text-[13px] text-white/65">{t("parent")}</span><h3 className="mt-2 text-xl font-black">{affiliation.parent?.name ?? t("none")}</h3><p className="mt-2 text-white/65">{affiliation.parent ? t("hasParent") : t("rootDescription")}</p></div></div><div className="grid content-start gap-4 rounded-lg border border-white/15 bg-black/25 p-[18px]"><div className="flex flex-wrap gap-2"><Chip active>{affiliation.type}</Chip><Chip>{affiliation.visibility.toLowerCase()}</Chip></div><h3 className="text-xl font-black">{t("description")}</h3><div className="rounded-lg border border-white/10 bg-black/40 p-[18px]"><MarkdownViewer>{affiliation.description ?? t("descriptionFallback")}</MarkdownViewer></div></div></div></Panel>
    <Panel><h2 className="mb-5 text-[28px] font-black">{t("members")}</h2>{affiliation.characterAffiliations.length ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{affiliation.characterAffiliations.map((connection) => <Link className="grid min-h-[200px] gap-3 rounded-lg border border-white/15 bg-white/[0.055] p-[18px]" href={`/characters/${connection.character.id}`} key={connection.id}><div className="flex justify-between"><Chip active={connection.isPrimary}><EntityLabel name="character" /></Chip><span className="text-[13px] text-white/65">{connection.status === "CURRENT" ? t("current") : connection.status === "FORMER" ? t("former") : t("unknown")}</span></div><h3 className="text-xl font-black">{connection.character.name}</h3><p className="text-white/65">{connection.character.summary ?? t("characterDescriptionEmpty")}</p><div className="flex flex-wrap gap-2">{connection.title ? <Chip>{connection.title}</Chip> : null}{connection.isPrimary ? <Chip>{t("primary")}</Chip> : null}</div></Link>)}</div> : <div className="grid min-h-52 place-items-center rounded-lg border border-dashed border-white/15 text-white/60">{t("noMembers")}</div>}</Panel>
  </PageShell>;
}

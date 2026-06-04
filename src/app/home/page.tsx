import { getTranslations } from "next-intl/server";
import { PageShell } from "@/components/page-shell";
import { RoutePlaceholder } from "@/components/routes/route-placeholder";
import { createSeoMetadata } from "@/lib/seo";

export const metadata = createSeoMetadata({
  title: "홈",
  description: "Zac의 주요 창작 관리 기능과 탐색 화면으로 이동하는 홈 화면입니다.",
  path: "/home",
});

export default async function HomePage() {
  const t = await getTranslations("home");
  return (
    <PageShell>
      <RoutePlaceholder
        eyebrow="Home"
        title={t("title")}
        description={t("description")}
        variant="explore"
      />
    </PageShell>
  );
}

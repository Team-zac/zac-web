import { useTranslations } from "next-intl";

type EntityLabelProps = {
  name: "affiliation" | "chapter" | "character" | "graph" | "invite" | "work" | "workspace" | "world";
};

export function EntityLabel({ name }: EntityLabelProps) {
  const t = useTranslations("entities");

  return <>{t(name)}</>;
}

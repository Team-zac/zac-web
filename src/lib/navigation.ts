export type MainNavItem = {
  label: string;
  href: string;
  key: "worlds" | "characters" | "works" | "workspace";
};

export const mainNavItems: MainNavItem[] = [
  { label: "세계관", href: "/worlds/explore", key: "worlds" },
  { label: "캐릭터", href: "/characters/explore", key: "characters" },
  { label: "창작물", href: "/works/explore", key: "works" },
  { label: "내 작업", href: "/workspace", key: "workspace" },
];

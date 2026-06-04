import type { ReactNode } from "react";
import { AppHeader } from "@/components/app-header";
import type { MainNavItem } from "@/lib/navigation";

type PageShellProps = {
  activeKey?: MainNavItem["key"];
  children: ReactNode;
};

export function PageShell({ activeKey, children }: PageShellProps) {
  return (
    <>
      <AppHeader activeKey={activeKey} />
      <main className="min-h-screen px-5 pt-32 pb-20 [@media(max-width:512px)]:px-3.5 [@media(max-width:512px)]:pt-28 [@media(max-width:512px)]:pb-28">
        <div className="mx-auto grid w-full max-w-7xl min-w-0 gap-7">{children}</div>
      </main>
    </>
  );
}

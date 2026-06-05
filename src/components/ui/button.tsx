import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

type ButtonTone = "primary" | "ghost" | "danger" | "text";

function buttonClassName(tone: ButtonTone, className?: string) {
  const toneClass =
    tone === "primary"
      ? "border-transparent bg-gradient-to-br from-[#E100FF] to-[#FF0040] text-white shadow-[0_12px_30px_rgba(255,0,64,0.24)]"
      : tone === "danger"
        ? "border-[#FF0040]/45 bg-[#FF0040]/10 text-[#ff8aa7]"
        : tone === "text"
          ? "min-h-0 border-0 bg-transparent px-0 text-white/65"
          : "border-white/20 bg-white/[0.06] text-white";

  return [
    "inline-flex min-h-[42px] items-center justify-center rounded-lg border px-[18px] font-black whitespace-nowrap outline-none focus-visible:ring-3 focus-visible:ring-[#E100FF]/45 focus-visible:ring-offset-4 focus-visible:ring-offset-black",
    toneClass,
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

type ButtonLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  children: ReactNode;
  href: string;
  tone?: ButtonTone;
};

export function ButtonLink({
  children,
  className,
  href,
  tone = "ghost",
  ...props
}: ButtonLinkProps) {
  return (
    <Link className={buttonClassName(tone, className)} href={href} {...props}>
      {children}
    </Link>
  );
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: ButtonTone;
};

export function Button({ className, tone = "ghost", ...props }: ButtonProps) {
  return <button className={buttonClassName(tone, className)} {...props} />;
}

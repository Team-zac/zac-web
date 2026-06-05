import type { ReactNode } from "react";

type ChipProps = {
  children: ReactNode;
  active?: boolean;
  className?: string;
};

export function Chip({ active, children, className }: ChipProps) {
  return (
    <span
      className={[
        "inline-flex min-h-7 w-fit items-center rounded-full border px-2.5 text-[13px] font-black whitespace-nowrap",
        active
          ? "border-[#E100FF]/60 bg-[#E100FF]/15 text-white"
          : "border-white/20 text-white/70",
        className,
      ].join(" ")}
    >
      {children}
    </span>
  );
}

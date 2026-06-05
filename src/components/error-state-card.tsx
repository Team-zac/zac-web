"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type ErrorStateCardProps = {
  description: string;
  message?: string;
  title: string;
};

export function ErrorStateCard({ description, message, title }: ErrorStateCardProps) {
  const router = useRouter();

  return (
    <main className="grid min-h-screen place-items-center px-5 py-20">
      <section
        aria-labelledby="error-state-title"
        className="grid w-full max-w-md justify-items-center gap-5 rounded-lg border border-white/15 bg-white/[0.055] p-8 text-center shadow-[0_22px_54px_rgba(0,0,0,0.26)] backdrop-blur-xl"
        role="alert"
      >
        <div
          aria-hidden="true"
          className="grid h-14 w-14 place-items-center rounded-full border border-[#FF0040]/45 bg-[#FF0040]/10 text-2xl font-black text-[#ff8aa7]"
        >
          !
        </div>
        <div className="grid gap-2">
          <h1 className="text-3xl leading-tight font-black" id="error-state-title">
            {title}
          </h1>
          <p className="text-white/70">{description}</p>
          {message ? (
            <p className="rounded-lg border border-white/10 bg-black/30 px-4 py-3 text-sm font-bold break-words text-white/80">
              {message}
            </p>
          ) : null}
        </div>
        <Button onClick={() => router.back()} type="button">
          이전으로
        </Button>
      </section>
    </main>
  );
}

import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { isAppLocale } from "@/i18n/routing";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const locale = typeof body.locale === "string" ? body.locale : undefined;

  if (!isAppLocale(locale)) {
    return NextResponse.json({ message: "Unsupported locale" }, { status: 400 });
  }

  (await cookies()).set("NEXT_LOCALE", locale, {
    path: "/",
    sameSite: "lax",
  });

  return NextResponse.json({ locale });
}

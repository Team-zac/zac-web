import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";

import { isAppLocale, routing } from "@/i18n/routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const requestedLocale = await requestLocale;
  const cookieLocale = (await cookies()).get("NEXT_LOCALE")?.value;
  const locale = isAppLocale(requestedLocale)
    ? requestedLocale
    : isAppLocale(cookieLocale)
      ? cookieLocale
      : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});

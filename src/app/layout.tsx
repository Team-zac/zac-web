import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages, getTranslations } from "next-intl/server";
import { defaultSeoImage, getSiteUrl, siteName } from "@/lib/seo";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata");

  return {
    title: {
      default: "Zac",
      template: "%s | Zac",
    },
    description: t("description"),
    metadataBase: new URL(getSiteUrl()),
    icons: {
      apple: defaultSeoImage,
      icon: "/favicon.ico",
    },
    openGraph: {
      title: siteName,
      description: t("description"),
      images: [defaultSeoImage],
      siteName,
      type: "website",
      url: getSiteUrl(),
    },
    twitter: {
      card: "summary_large_image",
      title: siteName,
      description: t("description"),
      images: [defaultSeoImage],
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [locale, messages] = await Promise.all([getLocale(), getMessages()]);

  return (
    <html lang={locale}>
      <body className="relative min-h-screen overflow-x-hidden bg-black font-sans text-white antialiased">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <div className="pointer-events-none fixed inset-0 z-0 bg-[linear-gradient(135deg,rgba(225,0,255,0.24),transparent_32%),linear-gradient(315deg,rgba(255,0,64,0.22),transparent_38%),#000000]" data-app-background />
          <div className="pointer-events-none fixed inset-0 z-0 bg-[linear-gradient(rgba(255,255,255,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.055)_1px,transparent_1px)] bg-[length:56px_56px] [mask-image:radial-gradient(circle_at_center,black,transparent_76%)]" data-grid-background />
          <div className="relative z-10">
            {children}
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

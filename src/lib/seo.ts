import type { Metadata } from "next";

export const defaultSeoImage = "/default_image.png";
export const siteName = "Zac";

export function getSiteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

export function absoluteUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${getSiteUrl()}${normalizedPath}`;
}

export function createSeoMetadata({
  description,
  path,
  title,
}: {
  description: string;
  path?: string;
  title: string;
}): Metadata {
  const url = path ? absoluteUrl(path) : getSiteUrl();
  const images = [defaultSeoImage];

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      images,
      siteName,
      type: "website",
      url,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images,
    },
  };
}

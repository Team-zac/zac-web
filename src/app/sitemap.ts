import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";
import { prisma } from "@/server/db";

const staticRoutes = [
  "/",
  "/home",
  "/login",
  "/signup",
  "/workspace",
  "/worlds",
  "/worlds/explore",
  "/worlds/new",
  "/characters",
  "/characters/explore",
  "/characters/new",
  "/works",
  "/works/explore",
  "/works/new",
  "/affiliations",
  "/affiliations/new",
  "/relations",
];

function sitemapEntry(
  path: string,
  lastModified: Date,
  priority = 0.7,
): MetadataRoute.Sitemap[number] {
  return {
    url: absoluteUrl(path),
    lastModified,
    changeFrequency: "weekly",
    priority,
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const [worlds, characters, works, affiliations] = await Promise.all([
    prisma.world.findMany({
      where: { deletedAt: null, visibility: "PUBLIC" },
      select: { id: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
      take: 500,
    }),
    prisma.character.findMany({
      where: {
        deletedAt: null,
        visibility: "PUBLIC",
        world: { deletedAt: null, visibility: "PUBLIC" },
      },
      select: { id: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
      take: 500,
    }),
    prisma.work.findMany({
      where: {
        deletedAt: null,
        publishStatus: "PUBLISHED",
        visibility: "PUBLIC",
        world: { deletedAt: null, visibility: "PUBLIC" },
      },
      select: { id: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
      take: 500,
    }),
    prisma.affiliation.findMany({
      where: {
        deletedAt: null,
        visibility: "PUBLIC",
        world: { deletedAt: null, visibility: "PUBLIC" },
      },
      select: { id: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
      take: 500,
    }),
  ]);

  return [
    ...staticRoutes.map((route, index) =>
      sitemapEntry(route, now, index === 0 ? 1 : 0.75),
    ),
    ...worlds.map((world) => sitemapEntry(`/worlds/${world.id}`, world.updatedAt, 0.8)),
    ...characters.map((character) =>
      sitemapEntry(`/characters/${character.id}`, character.updatedAt, 0.75),
    ),
    ...works.flatMap((work) => [
      sitemapEntry(`/works/${work.id}`, work.updatedAt, 0.8),
      sitemapEntry(`/works/${work.id}/read`, work.updatedAt, 0.7),
    ]),
    ...affiliations.map((affiliation) =>
      sitemapEntry(`/affiliations/${affiliation.id}`, affiliation.updatedAt, 0.65),
    ),
  ];
}

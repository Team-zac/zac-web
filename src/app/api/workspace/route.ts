import { Prisma } from "@prisma/client";

import { apiError, apiJson } from "@/lib/api-fetch";
import { prisma } from "@/server/db";
import { requireUser } from "@/server/permissions";

const accessibleWorldWhere = (userId: string): Prisma.WorldWhereInput => ({
  deletedAt: null,
  OR: [{ ownerId: userId }, { members: { some: { userId } } }],
});

function clean(value: string | null | undefined, fallback: string) {
  return value
    ?.replace(/^#{1,6}\s+/gm, "")
    .replace(/^-\s+/gm, "")
    .replace(/`|\*\*/g, "")
    .replace(/\s+/g, " ")
    .trim() || fallback;
}

export async function GET() {
  try {
    const user = await requireUser();
    const [worldCount, characterCount, workCount, worlds, characters, works] = await prisma.$transaction([
      prisma.world.count({ where: accessibleWorldWhere(user.id) }),
      prisma.character.count({ where: { deletedAt: null, world: accessibleWorldWhere(user.id) } }),
      prisma.work.count({ where: { deletedAt: null, world: accessibleWorldWhere(user.id) } }),
      prisma.world.findMany({
        where: accessibleWorldWhere(user.id),
        orderBy: { updatedAt: "desc" },
        take: 8,
        select: {
          description: true,
          genre: true,
          id: true,
          title: true,
          updatedAt: true,
          viewCount: true,
          visibility: true,
          worldTags: { take: 4, select: { tag: { select: { name: true } } } },
        },
      }),
      prisma.character.findMany({
        where: { deletedAt: null, world: accessibleWorldWhere(user.id) },
        orderBy: { updatedAt: "desc" },
        take: 8,
        select: {
          alias: true,
          id: true,
          name: true,
          summary: true,
          updatedAt: true,
          viewCount: true,
          visibility: true,
          affiliations: { where: { isPrimary: true }, take: 1, select: { affiliation: { select: { name: true } } } },
          characterTags: { take: 3, select: { tag: { select: { name: true } } } },
          world: { select: { title: true } },
        },
      }),
      prisma.work.findMany({
        where: { deletedAt: null, world: accessibleWorldWhere(user.id) },
        orderBy: { updatedAt: "desc" },
        take: 8,
        select: {
          id: true,
          publishStatus: true,
          summary: true,
          title: true,
          type: true,
          updatedAt: true,
          viewCount: true,
          visibility: true,
          chapters: { where: { deletedAt: null }, select: { id: true } },
          workTags: { take: 3, select: { tag: { select: { name: true } } } },
          world: { select: { title: true } },
        },
      }),
    ]);
    return apiJson({
      characterCount,
      characters: characters.map((character) => ({
        alias: character.alias,
        id: character.id,
        name: character.name,
        primaryAffiliation: character.affiliations[0]?.affiliation.name ?? null,
        summary: clean(character.summary, "캐릭터 소개가 없습니다."),
        tags: character.characterTags.map(({ tag }) => tag.name),
        updatedAt: character.updatedAt,
        viewCount: character.viewCount,
        visibility: character.visibility,
        worldTitle: character.world.title,
      })),
      workCount,
      works: works.map((work) => ({
        chapterCount: work.chapters.length,
        id: work.id,
        publishStatus: work.publishStatus,
        summary: clean(work.summary, "창작물 소개가 없습니다."),
        tags: work.workTags.map(({ tag }) => tag.name),
        title: work.title,
        type: work.type,
        updatedAt: work.updatedAt,
        viewCount: work.viewCount,
        visibility: work.visibility,
        worldTitle: work.world.title,
      })),
      worldCount,
      worlds: worlds.map((world) => ({
        description: clean(world.description, "세계관 소개가 없습니다."),
        genre: world.genre,
        id: world.id,
        tags: world.worldTags.map(({ tag }) => tag.name),
        title: world.title,
        updatedAt: world.updatedAt,
        viewCount: world.viewCount,
        visibility: world.visibility,
      })),
    });
  } catch (error) {
    return apiError(error, 400);
  }
}

import { Prisma, Visibility, WorldRole } from "@prisma/client";
import { NextRequest } from "next/server";

import { syncCharacterTags } from "@/app/api/_lib/tags";
import { parseCharacterInput } from "@/features/characters/character-input";
import { DEFAULT_PAGE_SIZE, normalizePage, pageCount, pageOffset } from "@/lib/pagination";
import { apiError, apiJson, readJson } from "@/lib/api-fetch";
import { prisma } from "@/server/db";
import { assertCanEditWorld, requireUser } from "@/server/permissions";

const cardSelect = {
  alias: true,
  id: true,
  name: true,
  summary: true,
  updatedAt: true,
  viewCount: true,
  visibility: true,
  world: { select: { title: true } },
  affiliations: {
    where: { isPrimary: true },
    take: 1,
    select: { affiliation: { select: { name: true } } },
  },
  characterTags: { select: { tag: { select: { name: true } } } },
} satisfies Prisma.CharacterSelect;

function toCard(character: Prisma.CharacterGetPayload<{ select: typeof cardSelect }>, role?: WorldRole) {
  return {
    alias: character.alias,
    id: character.id,
    name: character.name,
    primaryAffiliation: character.affiliations[0]?.affiliation.name ?? null,
    role,
    summary: character.summary ?? "아직 캐릭터 소개가 작성되지 않았습니다.",
    tags: character.characterTags.map(({ tag }) => tag.name),
    updatedAt: character.updatedAt,
    viewCount: character.viewCount,
    visibility: character.visibility,
    worldTitle: character.world.title,
  };
}

async function validateAffiliations(worldId: string, ids: string[]) {
  if (!ids.length) return;
  const count = await prisma.affiliation.count({ where: { deletedAt: null, id: { in: ids }, worldId } });
  if (count !== ids.length) throw new Error("선택한 소속은 캐릭터와 같은 세계관에 있어야 합니다.");
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const scope = searchParams.get("scope") ?? "public";
    const user = await requireUser().catch(() => null);

    if (scope === "editable-worlds") {
      if (!user) return apiJson([]);
      const editRoles = [WorldRole.OWNER, WorldRole.ADMIN, WorldRole.EDITOR];
      const worlds = await prisma.world.findMany({
        where: {
          deletedAt: null,
          OR: [{ ownerId: user.id }, { members: { some: { userId: user.id, role: { in: editRoles } } } }],
        },
        orderBy: { updatedAt: "desc" },
        include: {
          affiliations: { where: { deletedAt: null }, orderBy: { name: "asc" } },
          worldTags: { include: { tag: true } },
        },
      });
      return apiJson(worlds);
    }

    const page = normalizePage(searchParams.get("page"));
    if (scope === "my") {
      if (!user) throw new Error("로그인이 필요합니다.");
      const where: Prisma.CharacterWhereInput = {
        deletedAt: null,
        world: { deletedAt: null, OR: [{ ownerId: user.id }, { members: { some: { userId: user.id } } }] },
      };
      const [characters, total] = await prisma.$transaction([
        prisma.character.findMany({
          where,
          orderBy: { updatedAt: "desc" },
          skip: pageOffset(page),
          take: DEFAULT_PAGE_SIZE,
          select: {
            ...cardSelect,
            world: {
              select: {
                ownerId: true,
                title: true,
                members: { where: { userId: user.id }, select: { role: true }, take: 1 },
              },
            },
          },
        }),
        prisma.character.count({ where }),
      ]);
      return apiJson({
        characters: characters.map((character) =>
          toCard(character, character.world.ownerId === user.id ? WorldRole.OWNER : character.world.members[0]?.role),
        ),
        page,
        pageCount: pageCount(total),
        total,
      });
    }

    const query = searchParams.get("q")?.trim() ?? "";
    const sort = searchParams.get("sort") === "latest" ? "latest" : "popular";
    const normalizedQuery = query.replace(/^#/, "").trim();
    const where: Prisma.CharacterWhereInput = {
      deletedAt: null,
      visibility: Visibility.PUBLIC,
      world: { deletedAt: null, visibility: Visibility.PUBLIC },
      ...(normalizedQuery
        ? {
            OR: [
              { name: { contains: normalizedQuery, mode: "insensitive" } },
              { alias: { contains: normalizedQuery, mode: "insensitive" } },
              { summary: { contains: normalizedQuery, mode: "insensitive" } },
              { world: { title: { contains: normalizedQuery, mode: "insensitive" } } },
              { affiliations: { some: { affiliation: { name: { contains: normalizedQuery, mode: "insensitive" } } } } },
              { characterTags: { some: { tag: { normalized: { contains: normalizedQuery.toLocaleLowerCase("ko-KR") } } } } },
            ],
          }
        : {}),
    };
    const [characters, total] = await prisma.$transaction([
      prisma.character.findMany({
        where,
        orderBy: sort === "latest" ? { updatedAt: "desc" } : [{ viewCount: "desc" }, { updatedAt: "desc" }],
        skip: pageOffset(page),
        take: DEFAULT_PAGE_SIZE,
        select: cardSelect,
      }),
      prisma.character.count({ where }),
    ]);
    return apiJson({ characters: characters.map((character) => toCard(character)), pageCount: pageCount(total), total });
  } catch (error) {
    return apiError(error, 400);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const input = parseCharacterInput(await request.formData());
    await assertCanEditWorld(input.worldId, user.id);
    await validateAffiliations(input.worldId, input.affiliations.map(({ affiliationId }) => affiliationId));
    const character = await prisma.$transaction(async (tx) => {
      const created = await tx.character.create({
        data: {
          alias: input.alias,
          background: input.background,
          createdById: user.id,
          description: input.description,
          name: input.name,
          personality: input.personality,
          profileImageUrl: input.profileImageUrl,
          summary: input.summary,
          visibility: input.visibility,
          worldId: input.worldId,
          affiliations: {
            create: input.affiliations.map((item) => ({
              affiliationId: item.affiliationId,
              endedLabel: item.endedLabel || null,
              isPrimary: item.isPrimary,
              note: item.note || null,
              rank: item.rank || null,
              startedLabel: item.startedLabel || null,
              status: item.status,
              title: item.title || null,
              worldId: input.worldId,
            })),
          },
        },
      });
      await syncCharacterTags(tx, created.id, user.id, input.worldId, input.tags);
      return created;
    });
    return apiJson({ id: character.id, worldId: input.worldId });
  } catch (error) {
    return apiError(error, 400);
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await requireUser();
    const { characterIds } = await readJson<{ characterIds: string[] }>(request);
    const characters = await prisma.character.findMany({
      where: { deletedAt: null, id: { in: characterIds } },
      select: { id: true, worldId: true },
    });
    if (characters.length !== characterIds.length) throw new Error("삭제할 캐릭터를 찾을 수 없습니다.");
    for (const character of characters) await assertCanEditWorld(character.worldId, user.id);
    await prisma.character.updateMany({ where: { id: { in: characterIds } }, data: { deletedAt: new Date() } });
    return apiJson({ ok: true });
  } catch (error) {
    return apiError(error, 400);
  }
}

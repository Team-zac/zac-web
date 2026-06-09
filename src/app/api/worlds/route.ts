import { Prisma, Visibility, WorldRole } from "@prisma/client";
import { NextRequest } from "next/server";

import { syncWorldTags } from "@/app/api/_lib/tags";
import { parseWorldInput } from "@/features/worlds/world-input";
import { DEFAULT_PAGE_SIZE, normalizePage, pageCount, pageOffset } from "@/lib/pagination";
import { apiError, apiJson, readJson } from "@/lib/api-fetch";
import { prisma } from "@/server/db";
import { assertWorldOwner, requireUser } from "@/server/permissions";

const cardSelect = {
  description: true,
  genre: true,
  id: true,
  title: true,
  updatedAt: true,
  viewCount: true,
  visibility: true,
  worldTags: { select: { tag: { select: { name: true } } } },
} satisfies Prisma.WorldSelect;

function toCard(
  world: Prisma.WorldGetPayload<{ select: typeof cardSelect }>,
  role?: WorldRole,
) {
  const description =
    world.description
      ?.replace(/^#{1,6}\s+/gm, "")
      .replace(/^-\s+/gm, "")
      .replace(/`/g, "")
      .replace(/\s+/g, " ")
      .trim() || "아직 세계관 소개가 작성되지 않았습니다.";
  return { ...world, description, role, tags: world.worldTags.map(({ tag }) => tag.name) };
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const scope = searchParams.get("scope") ?? "public";
    const page = normalizePage(searchParams.get("page"));

    if (scope === "my") {
      const user = await requireUser();
      const where: Prisma.WorldWhereInput = {
        deletedAt: null,
        OR: [{ ownerId: user.id }, { members: { some: { userId: user.id } } }],
      };
      const [worlds, total] = await prisma.$transaction([
        prisma.world.findMany({
          where,
          orderBy: { updatedAt: "desc" },
          skip: pageOffset(page),
          take: DEFAULT_PAGE_SIZE,
          select: {
            ...cardSelect,
            ownerId: true,
            members: { where: { userId: user.id }, select: { role: true }, take: 1 },
          },
        }),
        prisma.world.count({ where }),
      ]);
      return apiJson({
        page,
        pageCount: pageCount(total),
        total,
        worlds: worlds.map((world) =>
          toCard(world, world.ownerId === user.id ? WorldRole.OWNER : world.members[0]?.role),
        ),
      });
    }

    const query = searchParams.get("q")?.trim() ?? "";
    const sort = searchParams.get("sort") === "latest" ? "latest" : "popular";
    const normalizedQuery = query.replace(/^#/, "").trim();
    const where: Prisma.WorldWhereInput = {
      deletedAt: null,
      visibility: Visibility.PUBLIC,
      ...(normalizedQuery
        ? {
            OR: [
              { title: { contains: normalizedQuery, mode: "insensitive" } },
              { description: { contains: normalizedQuery, mode: "insensitive" } },
              { genre: { contains: normalizedQuery, mode: "insensitive" } },
              { worldTags: { some: { tag: { normalized: { contains: normalizedQuery.toLocaleLowerCase("ko-KR") } } } } },
            ],
          }
        : {}),
    };
    const [worlds, total] = await prisma.$transaction([
      prisma.world.findMany({
        where,
        orderBy: sort === "latest" ? { updatedAt: "desc" } : [{ viewCount: "desc" }, { updatedAt: "desc" }],
        skip: pageOffset(page),
        take: DEFAULT_PAGE_SIZE,
        select: cardSelect,
      }),
      prisma.world.count({ where }),
    ]);
    return apiJson({
      page,
      pageCount: pageCount(total),
      total,
      worlds: worlds.map((world) => toCard(world)),
    });
  } catch (error) {
    return apiError(error, 400);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const formData = await request.formData();
    const input = parseWorldInput(formData);
    const world = await prisma.$transaction(async (tx) => {
      const created = await tx.world.create({
        data: {
          coverImageUrl: input.coverImageUrl,
          description: input.description,
          genre: input.genre,
          ownerId: user.id,
          slug: input.slug,
          title: input.title,
          visibility: input.visibility,
          members: { create: { role: WorldRole.OWNER, userId: user.id } },
        },
      });
      await syncWorldTags(tx, created.id, user.id, input.tags);
      return created;
    });
    return apiJson({ id: world.id });
  } catch (error) {
    return apiError(error, 400);
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await requireUser();
    const { worldIds } = await readJson<{ worldIds: string[] }>(request);
    for (const worldId of worldIds) await assertWorldOwner(worldId, user.id);
    await prisma.world.updateMany({
      where: { id: { in: worldIds }, ownerId: user.id },
      data: { deletedAt: new Date() },
    });
    return apiJson({ ok: true });
  } catch (error) {
    return apiError(error, 400);
  }
}

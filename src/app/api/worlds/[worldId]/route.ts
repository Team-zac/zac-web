import { Prisma } from "@prisma/client";
import { NextRequest } from "next/server";

import { syncWorldTags } from "@/app/api/_lib/tags";
import { parseWorldInput } from "@/features/worlds/world-input";
import { apiError, apiJson } from "@/lib/api-fetch";
import { prisma } from "@/server/db";
import { isAccessError } from "@/server/errors";
import { assertCanAdminWorld, assertCanEditWorld, assertCanReadWorld, requireUser } from "@/server/permissions";

type Context = { params: Promise<{ worldId: string }> };

export async function GET(request: NextRequest, { params }: Context) {
  try {
    const { worldId } = await params;
    const view = request.nextUrl.searchParams.get("view") ?? "detail";
    const user = await requireUser().catch(() => null);

    if (view === "edit") {
      if (!user) return apiJson(null);
      try {
        await assertCanEditWorld(worldId, user.id);
      } catch (error) {
        if (isAccessError(error)) return apiJson(null);
        throw error;
      }
      const world = await prisma.world.findFirst({
        where: { id: worldId, deletedAt: null },
        include: { worldTags: { include: { tag: true } } },
      });
      return apiJson(world);
    }

    if (view === "share") {
      if (!user) return apiJson(null);
      try {
        await assertCanAdminWorld(worldId, user.id);
      } catch (error) {
        if (isAccessError(error)) return apiJson(null);
        throw error;
      }
      const world = await prisma.world.findFirst({
        where: { id: worldId, deletedAt: null },
        include: {
          invites: { where: { status: "PENDING" }, orderBy: { createdAt: "desc" } },
          members: {
            orderBy: [{ role: "asc" }, { createdAt: "asc" }],
            include: { user: { select: { email: true, id: true, image: true, name: true } } },
          },
          owner: { select: { email: true, id: true, image: true, name: true } },
        },
      });
      return apiJson(world);
    }

    try {
      await assertCanReadWorld(worldId, user?.id);
    } catch (error) {
      if (isAccessError(error)) return apiJson(null);
      throw error;
    }
    const world = await prisma.world.findFirst({
      where: { id: worldId, deletedAt: null },
      include: {
        owner: { select: { email: true, id: true, image: true, name: true } },
        worldTags: { include: { tag: true } },
        characters: {
          where: { deletedAt: null },
          orderBy: [{ viewCount: "desc" }, { updatedAt: "desc" }],
          take: 4,
          include: { characterTags: { include: { tag: true } } },
        },
        affiliations: {
          where: { deletedAt: null },
          orderBy: [{ viewCount: "desc" }, { updatedAt: "desc" }],
          take: 4,
        },
        works: {
          where: { deletedAt: null },
          orderBy: [{ viewCount: "desc" }, { updatedAt: "desc" }],
          take: 4,
          include: { workTags: { include: { tag: true } } },
        },
        _count: { select: { affiliations: true, characters: true, works: true } },
      },
    });
    return apiJson(world);
  } catch (error) {
    return apiError(error, 400);
  }
}

export async function PATCH(request: Request, { params }: Context) {
  try {
    const { worldId } = await params;
    const user = await requireUser();
    await assertCanEditWorld(worldId, user.id);
    const input = parseWorldInput(await request.formData());
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.world.update({
        where: { id: worldId },
        data: {
          coverImageUrl: input.coverImageUrl,
          description: input.description,
          genre: input.genre,
          slug: input.slug,
          title: input.title,
          visibility: input.visibility,
        },
      });
      await syncWorldTags(tx, worldId, user.id, input.tags);
    });
    return apiJson({ id: worldId });
  } catch (error) {
    return apiError(error, 400);
  }
}

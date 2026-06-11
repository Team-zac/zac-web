import { NextRequest } from "next/server";

import { parseAffiliationInput } from "@/features/affiliations/affiliation-input";
import { apiError, apiJson } from "@/lib/api-fetch";
import { prisma } from "@/server/db";
import { isAccessError } from "@/server/errors";
import { assertCanEditWorld, assertCanReadWorld, requireUser } from "@/server/permissions";

type Context = { params: Promise<{ affiliationId: string }> };

async function validateParent(worldId: string, parentId: string | null, selfId?: string) {
  if (!parentId) return;
  if (parentId === selfId) throw new Error("자기 자신을 상위 소속으로 지정할 수 없습니다.");
  const parent = await prisma.affiliation.findFirst({ where: { deletedAt: null, id: parentId, worldId }, select: { parentId: true } });
  if (!parent) throw new Error("상위 소속은 같은 세계관에 있어야 합니다.");
  let cursor = parent.parentId;
  while (cursor) {
    if (cursor === selfId) throw new Error("소속 계층을 순환 구조로 만들 수 없습니다.");
    const ancestor = await prisma.affiliation.findFirst({ where: { deletedAt: null, id: cursor, worldId }, select: { parentId: true } });
    cursor = ancestor?.parentId ?? null;
  }
}

export async function GET(request: NextRequest, { params }: Context) {
  try {
    const { affiliationId } = await params;
    const view = request.nextUrl.searchParams.get("view") ?? "detail";
    const user = await requireUser().catch(() => null);
    const affiliation = await prisma.affiliation.findFirst({ where: { deletedAt: null, id: affiliationId }, select: { worldId: true } });
    if (!affiliation) return apiJson(null);
    if (view === "edit") {
      if (!user) return apiJson(null);
      try {
        await assertCanEditWorld(affiliation.worldId, user.id);
      } catch (error) {
        if (isAccessError(error)) return apiJson(null);
        throw error;
      }
      return apiJson(await prisma.affiliation.findFirst({
        where: { deletedAt: null, id: affiliationId },
        include: { world: { include: { affiliations: { where: { deletedAt: null, id: { not: affiliationId } }, orderBy: { name: "asc" } } } } },
      }));
    }
    try {
      await assertCanReadWorld(affiliation.worldId, user?.id);
    } catch (error) {
      if (isAccessError(error)) return apiJson(null);
      throw error;
    }
    return apiJson(await prisma.affiliation.findFirst({
      where: { deletedAt: null, id: affiliationId },
      include: {
        parent: true,
        world: true,
        characterAffiliations: {
          orderBy: [{ isPrimary: "desc" }, { updatedAt: "desc" }],
          include: { character: true },
        },
      },
    }));
  } catch (error) {
    return apiError(error, 400);
  }
}

export async function PATCH(request: Request, { params }: Context) {
  try {
    const { affiliationId } = await params;
    const user = await requireUser();
    const existing = await prisma.affiliation.findFirst({ where: { deletedAt: null, id: affiliationId }, select: { worldId: true } });
    if (!existing) throw new Error("소속을 찾을 수 없습니다.");
    await assertCanEditWorld(existing.worldId, user.id);
    const input = parseAffiliationInput(await request.formData());
    if (input.worldId !== existing.worldId) throw new Error("소속의 세계관은 변경할 수 없습니다.");
    await validateParent(input.worldId, input.parentId, affiliationId);
    await prisma.affiliation.update({ where: { id: affiliationId }, data: input });
    return apiJson({ id: affiliationId, worldId: input.worldId });
  } catch (error) {
    return apiError(error, 400);
  }
}

import { WorldRole } from "@prisma/client";

import { parseAffiliationInput } from "@/features/affiliations/affiliation-input";
import { apiError, apiJson, readJson } from "@/lib/api-fetch";
import { prisma } from "@/server/db";
import { assertCanEditWorld, requireUser } from "@/server/permissions";

async function validateParent(worldId: string, parentId: string | null, selfId?: string) {
  if (!parentId) return;
  if (parentId === selfId) throw new Error("자기 자신을 상위 소속으로 지정할 수 없습니다.");
  const parent = await prisma.affiliation.findFirst({
    where: { deletedAt: null, id: parentId, worldId },
    select: { parentId: true },
  });
  if (!parent) throw new Error("상위 소속은 같은 세계관에 있어야 합니다.");
  let cursor = parent.parentId;
  while (cursor) {
    if (cursor === selfId) throw new Error("소속 계층을 순환 구조로 만들 수 없습니다.");
    const ancestor = await prisma.affiliation.findFirst({
      where: { deletedAt: null, id: cursor, worldId },
      select: { parentId: true },
    });
    cursor = ancestor?.parentId ?? null;
  }
}

export async function GET() {
  try {
    const user = await requireUser();
    const affiliations = await prisma.affiliation.findMany({
      where: {
        deletedAt: null,
        world: { deletedAt: null, OR: [{ ownerId: user.id }, { members: { some: { userId: user.id } } }] },
      },
      orderBy: { updatedAt: "desc" },
      include: {
        world: {
          select: {
            ownerId: true,
            title: true,
            members: { where: { userId: user.id }, select: { role: true }, take: 1 },
          },
        },
        parent: true,
        _count: { select: { characterAffiliations: true } },
      },
    });
    return apiJson(affiliations.map((item) => ({
      ...item,
      role: item.world.ownerId === user.id ? WorldRole.OWNER : item.world.members[0]?.role,
    })));
  } catch (error) {
    return apiError(error, 400);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const input = parseAffiliationInput(await request.formData());
    await assertCanEditWorld(input.worldId, user.id);
    await validateParent(input.worldId, input.parentId);
    const affiliation = await prisma.affiliation.create({ data: input });
    return apiJson({ id: affiliation.id, worldId: input.worldId });
  } catch (error) {
    return apiError(error, 400);
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await requireUser();
    const { affiliationIds } = await readJson<{ affiliationIds: string[] }>(request);
    const affiliations = await prisma.affiliation.findMany({
      where: { deletedAt: null, id: { in: affiliationIds } },
      select: { id: true, worldId: true },
    });
    if (affiliations.length !== affiliationIds.length) throw new Error("삭제할 소속을 찾을 수 없습니다.");
    for (const affiliation of affiliations) await assertCanEditWorld(affiliation.worldId, user.id);
    await prisma.$transaction([
      prisma.characterAffiliation.deleteMany({ where: { affiliationId: { in: affiliationIds } } }),
      prisma.affiliation.updateMany({ where: { parentId: { in: affiliationIds } }, data: { parentId: null } }),
      prisma.affiliation.updateMany({ where: { id: { in: affiliationIds } }, data: { deletedAt: new Date() } }),
    ]);
    return apiJson({ ok: true });
  } catch (error) {
    return apiError(error, 400);
  }
}

import { parseRelationInput } from "@/features/relations/relation-input";
import { apiError, apiJson } from "@/lib/api-fetch";
import { prisma } from "@/server/db";
import { assertCanEditWorld, requireUser } from "@/server/permissions";

type Context = { params: Promise<{ relationId: string }> };

async function validateRelationBoundary(input: ReturnType<typeof parseRelationInput>) {
  const characters = await prisma.character.findMany({
    where: { deletedAt: null, id: { in: [input.sourceCharacterId, input.targetCharacterId] }, worldId: input.worldId },
    select: { id: true },
  });
  if (characters.length !== 2) throw new Error("출발 캐릭터와 대상 캐릭터는 같은 세계관에 속해야 합니다.");
  if (input.contextAffiliationId) {
    const affiliation = await prisma.affiliation.findFirst({
      where: { deletedAt: null, id: input.contextAffiliationId, worldId: input.worldId },
      select: { id: true },
    });
    if (!affiliation) throw new Error("관계 맥락 소속은 같은 세계관에 있어야 합니다.");
  }
}

export async function PATCH(request: Request, { params }: Context) {
  try {
    const { relationId } = await params;
    const user = await requireUser();
    const relation = await prisma.characterRelation.findFirst({ where: { deletedAt: null, id: relationId }, select: { worldId: true } });
    if (!relation) throw new Error("관계를 찾을 수 없습니다.");
    const input = parseRelationInput(await request.formData(), relation.worldId);
    if (input.worldId !== relation.worldId) throw new Error("관계의 세계관은 변경할 수 없습니다.");
    await assertCanEditWorld(relation.worldId, user.id);
    await validateRelationBoundary(input);
    await prisma.characterRelation.update({
      where: { id: relationId },
      data: {
        contextAffiliationId: input.contextAffiliationId,
        description: input.description,
        direction: input.direction,
        name: input.name,
        sourceCharacterId: input.sourceCharacterId,
        status: input.status,
        targetCharacterId: input.targetCharacterId,
        visibility: input.visibility,
      },
    });
    return apiJson({ ok: true, worldId: relation.worldId });
  } catch (error) {
    return apiError(error, 400);
  }
}

export async function DELETE(_request: Request, { params }: Context) {
  try {
    const { relationId } = await params;
    const user = await requireUser();
    const relation = await prisma.characterRelation.findFirst({ where: { deletedAt: null, id: relationId }, select: { worldId: true } });
    if (!relation) throw new Error("관계를 찾을 수 없습니다.");
    await assertCanEditWorld(relation.worldId, user.id);
    await prisma.characterRelation.update({ where: { id: relationId }, data: { deletedAt: new Date() } });
    return apiJson({ ok: true, worldId: relation.worldId });
  } catch (error) {
    return apiError(error, 400);
  }
}

import { NextRequest } from "next/server";

import { syncCharacterTags } from "@/app/api/_lib/tags";
import { parseCharacterInput } from "@/features/characters/character-input";
import { apiError, apiJson } from "@/lib/api-fetch";
import { prisma } from "@/server/db";
import { isAccessError } from "@/server/errors";
import { assertCanEditWorld, assertCanReadWorld, requireUser } from "@/server/permissions";

type Context = { params: Promise<{ characterId: string }> };

async function validateAffiliations(worldId: string, ids: string[]) {
  if (!ids.length) return;
  const count = await prisma.affiliation.count({ where: { deletedAt: null, id: { in: ids }, worldId } });
  if (count !== ids.length) throw new Error("선택한 소속은 캐릭터와 같은 세계관에 있어야 합니다.");
}

export async function GET(request: NextRequest, { params }: Context) {
  try {
    const { characterId } = await params;
    const view = request.nextUrl.searchParams.get("view") ?? "detail";
    const user = await requireUser().catch(() => null);
    const character = await prisma.character.findFirst({ where: { deletedAt: null, id: characterId }, select: { worldId: true } });
    if (!character) return apiJson(null);

    if (view === "edit") {
      if (!user) return apiJson(null);
      try {
        await assertCanEditWorld(character.worldId, user.id);
      } catch (error) {
        if (isAccessError(error)) return apiJson(null);
        throw error;
      }
      return apiJson(await prisma.character.findFirst({
        where: { deletedAt: null, id: characterId },
        include: {
          characterTags: { include: { tag: true } },
          affiliations: { include: { affiliation: true } },
          world: { include: { affiliations: { where: { deletedAt: null }, orderBy: { name: "asc" } }, worldTags: { include: { tag: true } } } },
        },
      }));
    }

    try {
      await assertCanReadWorld(character.worldId, user?.id);
    } catch (error) {
      if (isAccessError(error)) return apiJson(null);
      throw error;
    }
    return apiJson(await prisma.character.findFirst({
      where: { deletedAt: null, id: characterId },
      include: {
        world: true,
        characterTags: { include: { tag: true } },
        affiliations: { orderBy: [{ isPrimary: "desc" }, { updatedAt: "desc" }], include: { affiliation: true } },
        workCharacters: { orderBy: { createdAt: "desc" }, include: { work: true } },
        sourceRelations: { where: { deletedAt: null }, include: { targetCharacter: true } },
        targetRelations: { where: { deletedAt: null }, include: { sourceCharacter: true } },
      },
    }));
  } catch (error) {
    return apiError(error, 400);
  }
}

export async function PATCH(request: Request, { params }: Context) {
  try {
    const { characterId } = await params;
    const user = await requireUser();
    const existing = await prisma.character.findFirst({ where: { deletedAt: null, id: characterId }, select: { worldId: true } });
    if (!existing) throw new Error("캐릭터를 찾을 수 없습니다.");
    await assertCanEditWorld(existing.worldId, user.id);
    const input = parseCharacterInput(await request.formData());
    if (input.worldId !== existing.worldId) throw new Error("캐릭터의 세계관은 변경할 수 없습니다.");
    await validateAffiliations(input.worldId, input.affiliations.map(({ affiliationId }) => affiliationId));
    await prisma.$transaction(async (tx) => {
      await tx.character.update({
        where: { id: characterId },
        data: {
          alias: input.alias,
          background: input.background,
          description: input.description,
          name: input.name,
          personality: input.personality,
          profileImageUrl: input.profileImageUrl,
          summary: input.summary,
          visibility: input.visibility,
        },
      });
      await tx.characterAffiliation.deleteMany({ where: { characterId } });
      if (input.affiliations.length) {
        await tx.characterAffiliation.createMany({
          data: input.affiliations.map((item) => ({
            affiliationId: item.affiliationId,
            characterId,
            endedLabel: item.endedLabel || null,
            isPrimary: item.isPrimary,
            note: item.note || null,
            rank: item.rank || null,
            startedLabel: item.startedLabel || null,
            status: item.status,
            title: item.title || null,
            worldId: input.worldId,
          })),
        });
      }
      await syncCharacterTags(tx, characterId, user.id, input.worldId, input.tags);
    });
    return apiJson({ id: characterId, worldId: input.worldId });
  } catch (error) {
    return apiError(error, 400);
  }
}

import { apiError, apiJson } from "@/lib/api-fetch";
import { prisma } from "@/server/db";
import { isAccessError } from "@/server/errors";
import { assertCanReadWorld, requireUser } from "@/server/permissions";

type Context = { params: Promise<{ characterId: string }> };

export async function POST(_request: Request, { params }: Context) {
  try {
    const { characterId } = await params;
    const [character, user] = await Promise.all([
      prisma.character.findFirst({
        where: { deletedAt: null, id: characterId },
        select: { worldId: true },
      }),
      requireUser().catch(() => null),
    ]);

    if (!character) {
      return apiJson({ error: "Character not found." }, { status: 404 });
    }

    try {
      await assertCanReadWorld(character.worldId, user?.id);
    } catch (error) {
      if (isAccessError(error)) {
        return apiJson({ error: "Character not found." }, { status: 404 });
      }
      throw error;
    }

    const result = await prisma.character.updateMany({
      where: { deletedAt: null, id: characterId },
      data: { viewCount: { increment: 1 } },
    });

    if (!result.count) {
      return apiJson({ error: "Character not found." }, { status: 404 });
    }

    return apiJson({ ok: true });
  } catch (error) {
    return apiError(error, 400);
  }
}

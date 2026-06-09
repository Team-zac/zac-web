import { apiError, apiJson } from "@/lib/api-fetch";
import { prisma } from "@/server/db";
import { isAccessError } from "@/server/errors";
import { assertCanReadWorld, requireUser } from "@/server/permissions";

type Context = { params: Promise<{ worldId: string }> };

export async function POST(_request: Request, { params }: Context) {
  try {
    const { worldId } = await params;
    const [world, user] = await Promise.all([
      prisma.world.findFirst({
        where: { deletedAt: null, id: worldId },
        select: { id: true },
      }),
      requireUser().catch(() => null),
    ]);

    if (!world) {
      return apiJson({ error: "World not found." }, { status: 404 });
    }

    try {
      await assertCanReadWorld(worldId, user?.id);
    } catch (error) {
      if (isAccessError(error)) {
        return apiJson({ error: "World not found." }, { status: 404 });
      }
      throw error;
    }

    await prisma.world.update({
      where: { id: worldId },
      data: { viewCount: { increment: 1 } },
    });

    return apiJson({ ok: true });
  } catch (error) {
    return apiError(error, 400);
  }
}

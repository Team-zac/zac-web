import { apiError, apiJson } from "@/lib/api-fetch";
import { prisma } from "@/server/db";
import { isAccessError } from "@/server/errors";
import { assertCanReadWorld, requireUser } from "@/server/permissions";

type Context = { params: Promise<{ workId: string }> };

export async function POST(_request: Request, { params }: Context) {
  try {
    const { workId } = await params;
    const [work, user] = await Promise.all([
      prisma.work.findFirst({
        where: { deletedAt: null, id: workId },
        select: { worldId: true },
      }),
      requireUser().catch(() => null),
    ]);

    if (!work) {
      return apiJson({ error: "Work not found." }, { status: 404 });
    }

    try {
      await assertCanReadWorld(work.worldId, user?.id);
    } catch (error) {
      if (isAccessError(error)) {
        return apiJson({ error: "Work not found." }, { status: 404 });
      }
      throw error;
    }

    await prisma.work.update({
      where: { id: workId },
      data: { viewCount: { increment: 1 } },
    });

    return apiJson({ ok: true });
  } catch (error) {
    return apiError(error, 400);
  }
}

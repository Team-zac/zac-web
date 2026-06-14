import { apiError, apiJson } from "@/lib/api-fetch";
import { prisma } from "@/server/db";
import { assertCanEditWorld, requireUser } from "@/server/permissions";

type Context = { params: Promise<{ workId: string }> };

export async function POST(_request: Request, { params }: Context) {
  try {
    const { workId } = await params;
    const user = await requireUser();
    const work = await prisma.work.findFirst({ where: { deletedAt: null, id: workId }, select: { worldId: true } });
    if (!work) throw new Error("창작물을 찾을 수 없습니다.");
    await assertCanEditWorld(work.worldId, user.id);
    await prisma.work.update({ where: { id: workId }, data: { publishStatus: "PUBLISHED", visibility: "PUBLIC" } });
    await prisma.workChapter.updateMany({ where: { workId, deletedAt: null }, data: { publishStatus: "PUBLISHED", visibility: "PUBLIC" } });
    return apiJson({ id: workId });
  } catch (error) {
    return apiError(error, 400);
  }
}

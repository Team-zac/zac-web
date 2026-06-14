import { apiError, apiJson } from "@/lib/api-fetch";
import { prisma } from "@/server/db";
import { assertCanEditWorld, requireUser } from "@/server/permissions";

type Context = { params: Promise<{ workId: string }> };

export async function POST(_request: Request, { params }: Context) {
  try {
    const { workId } = await params;
    const user = await requireUser();
    const work = await prisma.work.findFirst({ where: { deletedAt: null, id: workId } });
    if (!work) throw new Error("창작물을 찾을 수 없습니다.");
    await assertCanEditWorld(work.worldId, user.id);
    const nextNumber = await prisma.workChapter.count({ where: { deletedAt: null, workId } }) + 1;
    await prisma.workChapter.create({
      data: {
        body: "# 새 챕터\n\n본문을 작성해주세요.",
        number: nextNumber,
        title: `새 챕터 ${nextNumber}`,
        visibility: work.visibility,
        publishStatus: work.publishStatus,
        workId,
        worldId: work.worldId,
      },
    });
    return apiJson({ ok: true });
  } catch (error) {
    return apiError(error, 400);
  }
}

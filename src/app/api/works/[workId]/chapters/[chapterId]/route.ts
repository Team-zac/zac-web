import { parseChapterInput } from "@/features/works/work-input";
import { apiError, apiJson } from "@/lib/api-fetch";
import { prisma } from "@/server/db";
import { assertCanEditWorld, requireUser } from "@/server/permissions";

type Context = { params: Promise<{ chapterId: string; workId: string }> };

export async function PATCH(request: Request, { params }: Context) {
  try {
    const { chapterId, workId } = await params;
    const user = await requireUser();
    const chapter = await prisma.workChapter.findFirst({ where: { deletedAt: null, id: chapterId, workId }, select: { worldId: true } });
    if (!chapter) throw new Error("챕터를 찾을 수 없습니다.");
    await assertCanEditWorld(chapter.worldId, user.id);
    await prisma.workChapter.update({ where: { id: chapterId }, data: parseChapterInput(await request.formData()) });
    return apiJson({ ok: true });
  } catch (error) {
    return apiError(error, 400);
  }
}

export async function DELETE(_request: Request, { params }: Context) {
  try {
    const { chapterId, workId } = await params;
    const user = await requireUser();
    const chapter = await prisma.workChapter.findFirst({ where: { deletedAt: null, id: chapterId, workId }, select: { worldId: true } });
    if (!chapter) throw new Error("챕터를 찾을 수 없습니다.");
    await assertCanEditWorld(chapter.worldId, user.id);
    await prisma.workChapter.update({ where: { id: chapterId }, data: { deletedAt: new Date() } });
    return apiJson({ ok: true });
  } catch (error) {
    return apiError(error, 400);
  }
}

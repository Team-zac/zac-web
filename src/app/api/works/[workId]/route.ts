import type { Prisma } from "@prisma/client";
import { NextRequest } from "next/server";

import { syncWorkTags } from "@/app/api/_lib/tags";
import { parseWorkInput } from "@/features/works/work-input";
import { normalizePage } from "@/lib/pagination";
import { apiError, apiJson } from "@/lib/api-fetch";
import { prisma } from "@/server/db";
import { isAccessError } from "@/server/errors";
import { assertCanEditWorld, assertCanReadWorld, requireUser } from "@/server/permissions";

type Context = { params: Promise<{ workId: string }> };

async function validateConnections(worldId: string, characterIds: string[], affiliationIds: string[]) {
  if (characterIds.length) {
    const count = await prisma.character.count({ where: { deletedAt: null, id: { in: characterIds }, worldId } });
    if (count !== characterIds.length) throw new Error("등장인물은 창작물과 같은 세계관에 있어야 합니다.");
  }
  if (affiliationIds.length) {
    const count = await prisma.affiliation.count({ where: { deletedAt: null, id: { in: affiliationIds }, worldId } });
    if (count !== affiliationIds.length) throw new Error("등장소속은 창작물과 같은 세계관에 있어야 합니다.");
  }
}

async function syncConnections(tx: Prisma.TransactionClient, workId: string, worldId: string, input: ReturnType<typeof parseWorkInput>) {
  await tx.workCharacter.deleteMany({ where: { workId } });
  await tx.workAffiliation.deleteMany({ where: { workId } });
  if (input.characters.length) {
    await tx.workCharacter.createMany({
      data: input.characters.map((item) => ({ characterId: item.characterId, note: item.note || null, role: item.role, workId, worldId })),
    });
  }
  if (input.affiliations.length) {
    await tx.workAffiliation.createMany({
      data: input.affiliations.map((item) => ({ affiliationId: item.affiliationId, note: item.note || null, workId, worldId })),
    });
  }
}

export async function GET(request: NextRequest, { params }: Context) {
  try {
    const { workId } = await params;
    const view = request.nextUrl.searchParams.get("view") ?? "detail";
    const user = await requireUser().catch(() => null);
    const work = await prisma.work.findFirst({ where: { deletedAt: null, id: workId }, select: { worldId: true } });
    if (!work) return apiJson(null);

    if (view === "edit") {
      if (!user) return apiJson(null);
      try {
        await assertCanEditWorld(work.worldId, user.id);
      } catch (error) {
        if (isAccessError(error)) return apiJson(null);
        throw error;
      }
      return apiJson(await prisma.work.findFirst({
        where: { deletedAt: null, id: workId },
        include: {
          workAffiliations: { include: { affiliation: true }, orderBy: { createdAt: "asc" } },
          workCharacters: { include: { character: true }, orderBy: { createdAt: "asc" } },
          workTags: { include: { tag: true } },
          world: { include: { affiliations: { where: { deletedAt: null }, orderBy: { name: "asc" } }, characters: { where: { deletedAt: null }, orderBy: { name: "asc" } }, worldTags: { include: { tag: true } } } },
        },
      }));
    }

    if (view === "chapters") {
      if (!user) return apiJson(null);
      try {
        await assertCanEditWorld(work.worldId, user.id);
      } catch (error) {
        if (isAccessError(error)) return apiJson(null);
        throw error;
      }
      return apiJson(await prisma.work.findFirst({
        where: { deletedAt: null, id: workId },
        include: { chapters: { where: { deletedAt: null }, orderBy: { number: "asc" } }, world: true },
      }));
    }

    try {
      await assertCanReadWorld(work.worldId, user?.id);
    } catch (error) {
      if (isAccessError(error)) return apiJson(null);
      throw error;
    }

    if (view === "reader") {
      const readerWork = await prisma.work.findFirst({
        where: { deletedAt: null, id: workId },
        select: {
          id: true,
          summary: true,
          title: true,
          chapters: { where: { deletedAt: null }, orderBy: { number: "asc" }, select: { id: true, number: true, title: true } },
          world: { select: { title: true } },
          workTags: { include: { tag: true } },
        },
      });
      if (!readerWork) return apiJson(null);
      const requestedNumber = normalizePage(request.nextUrl.searchParams.get("chapter"));
      const selectedNumber = readerWork.chapters.some((chapter) => chapter.number === requestedNumber)
        ? requestedNumber
        : readerWork.chapters[0]?.number;
      const currentChapter = selectedNumber
        ? await prisma.workChapter.findFirst({
            where: { deletedAt: null, number: selectedNumber, workId },
            select: { body: true, id: true, number: true, title: true },
          })
        : null;
      return apiJson({ ...readerWork, currentChapter });
    }

    return apiJson(await prisma.work.findFirst({
      where: { deletedAt: null, id: workId },
      include: {
        author: { select: { name: true } },
        chapters: { where: { deletedAt: null }, orderBy: { number: "asc" } },
        workAffiliations: { include: { affiliation: true }, orderBy: { createdAt: "asc" } },
        workCharacters: { include: { character: true }, orderBy: { createdAt: "asc" } },
        workTags: { include: { tag: true } },
        world: { include: { members: user?.id ? { where: { userId: user.id }, take: 1 } : false } },
      },
    }));
  } catch (error) {
    return apiError(error, 400);
  }
}

export async function PATCH(request: Request, { params }: Context) {
  try {
    const { workId } = await params;
    const user = await requireUser();
    const existing = await prisma.work.findFirst({ where: { deletedAt: null, id: workId }, select: { worldId: true } });
    if (!existing) throw new Error("창작물을 찾을 수 없습니다.");
    await assertCanEditWorld(existing.worldId, user.id);
    const input = parseWorkInput(await request.formData(), existing.worldId);
    if (input.worldId !== existing.worldId) throw new Error("창작물의 세계관은 변경할 수 없습니다.");
    await validateConnections(existing.worldId, input.characters.map((item) => item.characterId), input.affiliations.map((item) => item.affiliationId));
    await prisma.$transaction(async (tx) => {
      await tx.work.update({
        where: { id: workId },
        data: {
          coverImageUrl: input.coverImageUrl,
          description: input.description,
          isOfficial: true,
          publishStatus: input.publishStatus,
          summary: input.summary,
          title: input.title,
          type: input.type,
          visibility: input.visibility,
        },
      });
      await syncConnections(tx, workId, existing.worldId, input);
      await syncWorkTags(tx, workId, user.id, existing.worldId, input.tags);
    });
    return apiJson({ id: workId, worldId: existing.worldId });
  } catch (error) {
    return apiError(error, 400);
  }
}

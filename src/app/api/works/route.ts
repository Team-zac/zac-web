import { Prisma, PublishStatus, Visibility, WorldRole } from "@prisma/client";
import { NextRequest } from "next/server";

import { syncWorkTags } from "@/app/api/_lib/tags";
import { parseWorkInput } from "@/features/works/work-input";
import { DEFAULT_PAGE_SIZE, normalizePage, pageCount, pageOffset } from "@/lib/pagination";
import { apiError, apiJson, readJson } from "@/lib/api-fetch";
import { prisma } from "@/server/db";
import { assertCanEditWorld, requireUser } from "@/server/permissions";

const editableRoles = [WorldRole.OWNER, WorldRole.ADMIN, WorldRole.EDITOR];
const workCardSelect = {
  id: true,
  publishStatus: true,
  summary: true,
  title: true,
  type: true,
  updatedAt: true,
  viewCount: true,
  visibility: true,
  world: { select: { title: true } },
  chapters: { where: { deletedAt: null }, select: { id: true } },
  workTags: { select: { tag: { select: { name: true } } } },
} satisfies Prisma.WorkSelect;

function toWorkCard(work: Prisma.WorkGetPayload<{ select: typeof workCardSelect }>) {
  return {
    chapterCount: work.chapters.length,
    id: work.id,
    publishStatus: work.publishStatus,
    summary: work.summary ?? "아직 창작물 소개가 작성되지 않았습니다.",
    tags: work.workTags.map(({ tag }) => tag.name),
    title: work.title,
    type: work.type,
    updatedAt: work.updatedAt,
    viewCount: work.viewCount,
    visibility: work.visibility,
    worldTitle: work.world.title,
  };
}

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

async function syncConnections(
  tx: Prisma.TransactionClient,
  workId: string,
  worldId: string,
  input: ReturnType<typeof parseWorkInput>,
) {
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

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const scope = searchParams.get("scope") ?? "public";
    const user = await requireUser().catch(() => null);

    if (scope === "editable-worlds") {
      if (!user) return apiJson([]);
      const worlds = await prisma.world.findMany({
        where: { deletedAt: null, OR: [{ ownerId: user.id }, { members: { some: { role: { in: editableRoles }, userId: user.id } } }] },
        orderBy: { updatedAt: "desc" },
        include: {
          affiliations: { where: { deletedAt: null }, orderBy: { name: "asc" } },
          characters: { where: { deletedAt: null }, orderBy: { name: "asc" } },
          worldTags: { include: { tag: true } },
        },
      });
      return apiJson(worlds);
    }

    const page = normalizePage(searchParams.get("page"));
    if (scope === "my") {
      if (!user) throw new Error("로그인이 필요합니다.");
      const where: Prisma.WorkWhereInput = {
        deletedAt: null,
        world: { deletedAt: null, OR: [{ ownerId: user.id }, { members: { some: { userId: user.id } } }] },
      };
      const [works, total] = await prisma.$transaction([
        prisma.work.findMany({ where, orderBy: { updatedAt: "desc" }, skip: pageOffset(page), take: DEFAULT_PAGE_SIZE, select: workCardSelect }),
        prisma.work.count({ where }),
      ]);
      return apiJson({ page, pageCount: pageCount(total), total, works: works.map(toWorkCard) });
    }

    const query = searchParams.get("q")?.trim() ?? "";
    const sort = searchParams.get("sort") === "latest" ? "latest" : "popular";
    const normalizedQuery = query.replace(/^#/, "").trim();
    const where: Prisma.WorkWhereInput = {
      deletedAt: null,
      publishStatus: PublishStatus.PUBLISHED,
      visibility: Visibility.PUBLIC,
      world: { deletedAt: null, visibility: Visibility.PUBLIC },
      ...(normalizedQuery
        ? {
            OR: [
              { title: { contains: normalizedQuery, mode: "insensitive" } },
              { summary: { contains: normalizedQuery, mode: "insensitive" } },
              { description: { contains: normalizedQuery, mode: "insensitive" } },
              { world: { title: { contains: normalizedQuery, mode: "insensitive" } } },
              { workTags: { some: { tag: { normalized: { contains: normalizedQuery.toLocaleLowerCase("ko-KR") } } } } },
            ],
          }
        : {}),
    };
    const [works, total] = await prisma.$transaction([
      prisma.work.findMany({
        where,
        orderBy: sort === "latest" ? { updatedAt: "desc" } : [{ viewCount: "desc" }, { updatedAt: "desc" }],
        skip: pageOffset(page),
        take: DEFAULT_PAGE_SIZE,
        select: workCardSelect,
      }),
      prisma.work.count({ where }),
    ]);
    return apiJson({ pageCount: pageCount(total), total, works: works.map(toWorkCard) });
  } catch (error) {
    return apiError(error, 400);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const input = parseWorkInput(await request.formData());
    await assertCanEditWorld(input.worldId, user.id);
    await validateConnections(input.worldId, input.characters.map((item) => item.characterId), input.affiliations.map((item) => item.affiliationId));
    const work = await prisma.$transaction(async (tx) => {
      const created = await tx.work.create({
        data: {
          authorId: user.id,
          coverImageUrl: input.coverImageUrl,
          description: input.description,
          isOfficial: true,
          publishStatus: input.publishStatus,
          summary: input.summary,
          title: input.title,
          type: input.type,
          visibility: input.visibility,
          worldId: input.worldId,
          chapters: { create: { body: "# 첫 챕터\n\n여기에 본문을 작성해주세요.", number: 1, title: "첫 챕터", visibility: input.visibility, publishStatus: input.publishStatus, worldId: input.worldId } },
        },
      });
      await syncConnections(tx, created.id, input.worldId, input);
      await syncWorkTags(tx, created.id, user.id, input.worldId, input.tags);
      return created;
    });
    return apiJson({ id: work.id, worldId: input.worldId });
  } catch (error) {
    return apiError(error, 400);
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await requireUser();
    const { workIds } = await readJson<{ workIds: string[] }>(request);
    const works = await prisma.work.findMany({ where: { deletedAt: null, id: { in: workIds } }, select: { id: true, worldId: true } });
    if (works.length !== workIds.length) throw new Error("삭제할 창작물을 찾을 수 없습니다.");
    for (const work of works) await assertCanEditWorld(work.worldId, user.id);
    await prisma.work.updateMany({ where: { id: { in: workIds } }, data: { deletedAt: new Date() } });
    return apiJson({ ok: true });
  } catch (error) {
    return apiError(error, 400);
  }
}

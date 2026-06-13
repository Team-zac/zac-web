import type { WorldRole } from "@prisma/client";
import { NextRequest } from "next/server";

import { parseRelationInput } from "@/features/relations/relation-input";
import type { RelationEdge, RelationNode } from "@/features/relations/types";
import { apiError, apiJson } from "@/lib/api-fetch";
import { canEditWorldRole } from "@/lib/roles";
import { prisma } from "@/server/db";
import { assertCanEditWorld, assertCanReadWorld, getWorldRole, requireUser } from "@/server/permissions";

const graphWidth = 1120;
const graphHeight = 760;
const nodeWidth = 144;
const nodeHeight = 80;

function canEditRole(role: WorldRole | null, ownerId: string, userId?: string) {
  return Boolean(userId && (ownerId === userId || canEditWorldRole(role)));
}

function nodePosition(index: number, total: number) {
  if (total <= 1) return { left: 488, top: 330 };
  const radiusX = 390;
  const radiusY = 240;
  const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
  return {
    left: Math.round(graphWidth / 2 + Math.cos(angle) * radiusX - nodeWidth / 2),
    top: Math.round(graphHeight / 2 + Math.sin(angle) * radiusY - nodeHeight / 2),
  };
}

function centeredNodePositions(characters: { id: string }[], centerCharacterId?: string) {
  if (!centerCharacterId) return new Map(characters.map((character, index) => [character.id, nodePosition(index, characters.length)]));
  const others = characters.filter((character) => character.id !== centerCharacterId);
  const positions = new Map<string, { left: number; top: number }>();
  positions.set(centerCharacterId, { left: 488, top: 330 });
  others.forEach((character, index) => {
    const radiusX = 390;
    const radiusY = 240;
    const angle = (Math.PI * 2 * index) / Math.max(1, others.length) - Math.PI / 2;
    positions.set(character.id, {
      left: Math.round(graphWidth / 2 + Math.cos(angle) * radiusX - nodeWidth / 2),
      top: Math.round(graphHeight / 2 + Math.sin(angle) * radiusY - nodeHeight / 2),
    });
  });
  return positions;
}

function edgeGeometry(source: RelationNode, target: RelationNode) {
  const sourceX = source.left + nodeWidth / 2;
  const sourceY = source.top + nodeHeight / 2;
  const targetX = target.left + nodeWidth / 2;
  const targetY = target.top + nodeHeight / 2;
  const dx = targetX - sourceX;
  const dy = targetY - sourceY;
  return { rotate: Math.atan2(dy, dx) * (180 / Math.PI), width: Math.sqrt(dx * dx + dy * dy), x: sourceX, y: sourceY - 12 };
}

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

export async function GET(request: NextRequest) {
  try {
    const worldId = request.nextUrl.searchParams.get("worldId");
    const centerCharacterId = request.nextUrl.searchParams.get("centerCharacterId") ?? undefined;
    const sessionUser = await requireUser().catch(() => null);
    if (!worldId) {
      const world = await prisma.world.findFirst({
        where: {
          deletedAt: null,
          OR: [{ visibility: "PUBLIC" }, ...(sessionUser ? [{ ownerId: sessionUser.id }, { members: { some: { userId: sessionUser.id } } }] : [])],
        },
        orderBy: { updatedAt: "desc" },
        select: { id: true },
      });
      return apiJson(world);
    }

    const worldAuth = await assertCanReadWorld(worldId, sessionUser?.id);
    const role = sessionUser?.id ? await getWorldRole(worldId, sessionUser.id) : null;
    const canEdit = canEditRole(role, worldAuth.ownerId, sessionUser?.id);
    const world = await prisma.world.findFirst({
      where: { deletedAt: null, id: worldId },
      select: {
        id: true,
        title: true,
        affiliations: { where: { deletedAt: null }, orderBy: { name: "asc" }, select: { id: true, name: true } },
        characters: {
          where: { deletedAt: null },
          orderBy: [{ viewCount: "desc" }, { updatedAt: "desc" }],
          take: 100,
          select: {
            id: true,
            name: true,
            affiliations: {
              orderBy: [{ isPrimary: "desc" }, { updatedAt: "desc" }],
              take: 1,
              select: { affiliation: { select: { color: true, id: true, name: true } } },
            },
          },
        },
        relations: {
          where: { deletedAt: null },
          orderBy: { updatedAt: "desc" },
          take: 300,
          include: {
            contextAffiliation: { select: { id: true, name: true } },
            sourceCharacter: { select: { id: true, name: true } },
            targetCharacter: { select: { id: true, name: true } },
          },
        },
      },
    });
    if (!world) throw new Error("세계관을 찾을 수 없습니다.");
    const positions = centeredNodePositions(world.characters, centerCharacterId);
    const nodes: RelationNode[] = world.characters.map((character, index) => {
      const position = positions.get(character.id) ?? nodePosition(index, world.characters.length);
      const affiliation = character.affiliations[0]?.affiliation;
      return {
        affiliationColor: affiliation?.color ?? null,
        affiliationId: affiliation?.id ?? null,
        affiliationName: affiliation?.name ?? null,
        id: character.id,
        left: position.left,
        name: character.name,
        top: position.top,
      };
    });
    const nodeMap = new Map(nodes.map((node) => [node.id, node]));
    const edges: RelationEdge[] = world.relations.flatMap((relation) => {
      const source = nodeMap.get(relation.sourceCharacterId);
      const target = nodeMap.get(relation.targetCharacterId);
      if (!source || !target) return [];
      return [{
        contextAffiliationId: relation.contextAffiliationId,
        contextAffiliationName: relation.contextAffiliation?.name ?? null,
        description: relation.description ?? "",
        direction: relation.direction,
        id: relation.id,
        name: relation.name,
        sourceCharacterId: relation.sourceCharacterId,
        sourceName: relation.sourceCharacter.name,
        status: relation.status,
        targetCharacterId: relation.targetCharacterId,
        targetName: relation.targetCharacter.name,
        visibility: relation.visibility,
        ...edgeGeometry(source, target),
      }];
    });
    return apiJson({
      affiliations: world.affiliations,
      canEdit,
      characters: world.characters.map((character) => ({ id: character.id, name: character.name })),
      edges,
      nodes,
      world: { id: world.id, title: world.title },
    });
  } catch (error) {
    return apiError(error, 400);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const input = parseRelationInput(await request.formData());
    await assertCanEditWorld(input.worldId, user.id);
    await validateRelationBoundary(input);
    await prisma.characterRelation.create({
      data: {
        contextAffiliationId: input.contextAffiliationId,
        createdById: user.id,
        description: input.description,
        direction: input.direction,
        name: input.name,
        sourceCharacterId: input.sourceCharacterId,
        status: input.status,
        targetCharacterId: input.targetCharacterId,
        visibility: input.visibility,
        worldId: input.worldId,
      },
    });
    return apiJson({ ok: true, worldId: input.worldId });
  } catch (error) {
    return apiError(error, 400);
  }
}

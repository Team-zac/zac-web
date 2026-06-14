import { Prisma, TagScope } from "@prisma/client";

export async function syncWorldTags(
  tx: Prisma.TransactionClient,
  worldId: string,
  userId: string,
  tags: string[],
) {
  await tx.worldTag.deleteMany({ where: { worldId } });
  for (const normalized of tags) {
    const tag = await tx.tag.upsert({
      where: { worldId_normalized_scope: { normalized, scope: TagScope.WORLD, worldId } },
      create: { createdById: userId, name: normalized, normalized, scope: TagScope.WORLD, worldId },
      update: { name: normalized },
    });
    await tx.worldTag.create({ data: { tagId: tag.id, worldId } });
  }
}

export async function syncCharacterTags(
  tx: Prisma.TransactionClient,
  characterId: string,
  userId: string,
  worldId: string,
  tags: string[],
) {
  await tx.characterTag.deleteMany({ where: { characterId } });
  for (const normalized of tags) {
    const tag = await tx.tag.upsert({
      where: { worldId_normalized_scope: { normalized, scope: TagScope.WORLD, worldId } },
      create: { createdById: userId, name: normalized, normalized, scope: TagScope.WORLD, worldId },
      update: { name: normalized },
    });
    await tx.characterTag.create({ data: { characterId, tagId: tag.id } });
  }
}

export async function syncWorkTags(
  tx: Prisma.TransactionClient,
  workId: string,
  userId: string,
  worldId: string,
  tags: string[],
) {
  await tx.workTag.deleteMany({ where: { workId } });
  for (const normalized of tags) {
    const tag = await tx.tag.upsert({
      where: { worldId_normalized_scope: { normalized, scope: TagScope.WORLD, worldId } },
      create: { createdById: userId, name: normalized, normalized, scope: TagScope.WORLD, worldId },
      update: { name: normalized },
    });
    await tx.workTag.create({ data: { tagId: tag.id, workId } });
  }
}

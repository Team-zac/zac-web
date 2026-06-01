import "server-only";

import { Visibility } from "@prisma/client";

import { canAdminWorldRole, canEditWorldRole } from "@/lib/roles";
import { getAuthSession } from "@/server/auth";
import { prisma } from "@/server/db";

export class AuthRequiredError extends Error {
  constructor(message = "로그인이 필요합니다.") {
    super(message);
    this.name = "AuthRequiredError";
  }
}

export class ForbiddenError extends Error {
  constructor(message = "접근 권한이 없습니다.") {
    super(message);
    this.name = "ForbiddenError";
  }
}

export class NotFoundError extends Error {
  constructor(message = "대상을 찾을 수 없습니다.") {
    super(message);
    this.name = "NotFoundError";
  }
}

export async function requireUser() {
  const session = await getAuthSession();
  const userId = session?.user?.id;

  if (!userId) {
    throw new AuthRequiredError();
  }

  const user = await prisma.user.findFirst({
    where: {
      id: userId,
      deletedAt: null,
    },
  });

  if (!user) {
    throw new AuthRequiredError();
  }

  return user;
}

export async function getWorldRole(worldId: string, userId: string) {
  const membership = await prisma.worldMember.findUnique({
    where: {
      worldId_userId: {
        worldId,
        userId,
      },
    },
    select: {
      role: true,
    },
  });

  return membership?.role ?? null;
}

export async function assertCanReadWorld(worldId: string, userId?: string) {
  const world = await prisma.world.findFirst({
    where: {
      id: worldId,
      deletedAt: null,
    },
    select: {
      id: true,
      ownerId: true,
      visibility: true,
    },
  });

  if (!world) {
    throw new NotFoundError("세계관을 찾을 수 없습니다.");
  }

  if (world.visibility === Visibility.PUBLIC) {
    return world;
  }

  if (!userId) {
    throw new AuthRequiredError();
  }

  if (world.ownerId === userId) {
    return world;
  }

  const role = await getWorldRole(worldId, userId);

  if (!role) {
    throw new ForbiddenError("세계관 읽기 권한이 없습니다.");
  }

  return world;
}

export async function assertCanEditWorld(worldId: string, userId: string) {
  const world = await assertCanReadWorld(worldId, userId);

  if (world.ownerId === userId) {
    return;
  }

  const role = await getWorldRole(worldId, userId);

  if (!canEditWorldRole(role)) {
    throw new ForbiddenError("세계관 편집 권한이 없습니다.");
  }
}

export async function assertCanAdminWorld(worldId: string, userId: string) {
  const world = await assertCanReadWorld(worldId, userId);

  if (world.ownerId === userId) {
    return;
  }

  const role = await getWorldRole(worldId, userId);

  if (!canAdminWorldRole(role)) {
    throw new ForbiddenError("세계관 관리 권한이 없습니다.");
  }
}

export async function assertWorldOwner(worldId: string, userId: string) {
  const world = await assertCanReadWorld(worldId, userId);

  if (world.ownerId !== userId) {
    throw new ForbiddenError("세계관 소유자만 수행할 수 있습니다.");
  }
}

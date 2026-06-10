import { InviteStatus } from "@prisma/client";

import { apiError, apiJson } from "@/lib/api-fetch";
import { prisma } from "@/server/db";
import { assertCanAdminWorld, requireUser } from "@/server/permissions";

type Context = { params: Promise<{ inviteId: string; worldId: string }> };

export async function DELETE(_request: Request, { params }: Context) {
  try {
    const { inviteId, worldId } = await params;
    const user = await requireUser();
    await assertCanAdminWorld(worldId, user.id);
    await prisma.worldInvite.updateMany({
      where: { id: inviteId, worldId, status: InviteStatus.PENDING },
      data: { status: InviteStatus.REVOKED },
    });
    return apiJson({ ok: true });
  } catch (error) {
    return apiError(error, 400);
  }
}

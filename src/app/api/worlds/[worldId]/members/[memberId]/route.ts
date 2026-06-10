import { WorldRole } from "@prisma/client";

import { apiError, apiJson } from "@/lib/api-fetch";
import { prisma } from "@/server/db";
import { assertCanAdminWorld, requireUser } from "@/server/permissions";

type Context = { params: Promise<{ memberId: string; worldId: string }> };

export async function PATCH(request: Request, { params }: Context) {
  try {
    const { memberId, worldId } = await params;
    const user = await requireUser();
    await assertCanAdminWorld(worldId, user.id);
    const formData = await request.formData();
    const roleValue = formData.get("role");
    const role =
      typeof roleValue === "string" && Object.values(WorldRole).includes(roleValue as WorldRole)
        ? roleValue as WorldRole
        : null;
    if (!role || role === WorldRole.OWNER) throw new Error("변경할 권한을 확인해주세요.");
    await prisma.worldMember.update({
      where: { id: memberId, worldId, role: { not: WorldRole.OWNER } },
      data: { role },
    });
    return apiJson({ ok: true });
  } catch (error) {
    return apiError(error, 400);
  }
}

export async function DELETE(_request: Request, { params }: Context) {
  try {
    const { memberId, worldId } = await params;
    const user = await requireUser();
    await assertCanAdminWorld(worldId, user.id);
    await prisma.worldMember.deleteMany({
      where: { id: memberId, worldId, role: { not: WorldRole.OWNER } },
    });
    return apiJson({ ok: true });
  } catch (error) {
    return apiError(error, 400);
  }
}

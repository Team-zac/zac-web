import { randomUUID } from "node:crypto";
import { InviteStatus, WorldRole } from "@prisma/client";

import { apiError, apiJson } from "@/lib/api-fetch";
import { prisma } from "@/server/db";
import { assertCanAdminWorld, requireUser } from "@/server/permissions";

type Context = { params: Promise<{ worldId: string }> };

export async function POST(request: Request, { params }: Context) {
  try {
    const { worldId } = await params;
    const user = await requireUser();
    await assertCanAdminWorld(worldId, user.id);
    const formData = await request.formData();
    const emailValue = formData.get("email");
    const roleValue = formData.get("role");
    const email = typeof emailValue === "string" ? emailValue.trim().toLowerCase() : "";
    const role =
      typeof roleValue === "string" && Object.values(WorldRole).includes(roleValue as WorldRole)
        ? roleValue as WorldRole
        : WorldRole.VIEWER;
    if (!email || role === WorldRole.OWNER) throw new Error("이메일과 초대 권한을 확인해주세요.");

    const invitedUser = await prisma.user.findUnique({ where: { email }, select: { id: true } });
    if (invitedUser) {
      await prisma.worldMember.upsert({
        where: { worldId_userId: { userId: invitedUser.id, worldId } },
        create: { invitedById: user.id, role, userId: invitedUser.id, worldId },
        update: { invitedById: user.id, role },
      });
    } else {
      await prisma.worldInvite.upsert({
        where: { worldId_email_status: { email, status: InviteStatus.PENDING, worldId } },
        create: { email, invitedById: user.id, role, token: randomUUID(), worldId },
        update: { invitedById: user.id, role, token: randomUUID() },
      });
    }
    return apiJson({ ok: true });
  } catch (error) {
    return apiError(error, 400);
  }
}

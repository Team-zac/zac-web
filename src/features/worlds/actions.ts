"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import type { WorldActionState } from "@/features/worlds/types";
import { apiFetch } from "@/lib/api-fetch";
import { actionError } from "@/server/errors";

export async function createWorldAction(
  _state: WorldActionState,
  formData: FormData,
): Promise<WorldActionState> {
  try {
    const world = await apiFetch<{ id: string }>("/api/worlds", { body: formData, method: "POST" });
    revalidatePath("/worlds");
    redirect(`/worlds/${world.id}`);
  } catch (error) {
    return actionError<WorldActionState>(error);
  }
}

export async function updateWorldAction(
  worldId: string,
  _state: WorldActionState,
  formData: FormData,
): Promise<WorldActionState> {
  try {
    await apiFetch(`/api/worlds/${worldId}`, { body: formData, method: "PATCH" });
    revalidatePath("/worlds");
    revalidatePath(`/worlds/${worldId}`);
    redirect(`/worlds/${worldId}`);
  } catch (error) {
    return actionError<WorldActionState>(error);
  }
}

export async function deleteWorldsAction(worldIds: string[]) {
  await apiFetch("/api/worlds", {
    body: JSON.stringify({ worldIds }),
    headers: { "content-type": "application/json" },
    method: "DELETE",
  });
  revalidatePath("/worlds");
}

export async function inviteWorldMemberAction(worldId: string, formData: FormData) {
  await apiFetch(`/api/worlds/${worldId}/members`, { body: formData, method: "POST" });
  revalidatePath(`/worlds/${worldId}/share`);
}

export async function updateWorldMemberRoleAction(
  worldId: string,
  memberId: string,
  formData: FormData,
) {
  await apiFetch(`/api/worlds/${worldId}/members/${memberId}`, { body: formData, method: "PATCH" });
  revalidatePath(`/worlds/${worldId}/share`);
}

export async function revokeWorldMemberAction(worldId: string, memberId: string) {
  await apiFetch(`/api/worlds/${worldId}/members/${memberId}`, { method: "DELETE" });
  revalidatePath(`/worlds/${worldId}/share`);
}

export async function revokeWorldInviteAction(worldId: string, inviteId: string) {
  await apiFetch(`/api/worlds/${worldId}/invites/${inviteId}`, { method: "DELETE" });
  revalidatePath(`/worlds/${worldId}/share`);
}

"use server";

import { revalidatePath } from "next/cache";

import type { RelationActionState } from "@/features/relations/types";
import { apiFetch } from "@/lib/api-fetch";
import { actionError } from "@/server/errors";

function revalidateRelationPaths(worldId: string) {
  revalidatePath("/relations");
  revalidatePath(`/relations?worldId=${worldId}`);
  revalidatePath(`/worlds/${worldId}`);
}

export async function createRelationAction(
  _state: RelationActionState,
  formData: FormData,
): Promise<RelationActionState> {
  try {
    const result = await apiFetch<{ ok: boolean; worldId: string }>("/api/relations", { body: formData, method: "POST" });
    revalidateRelationPaths(result.worldId);
    return { ok: true };
  } catch (error) {
    return actionError<RelationActionState>(error);
  }
}

export async function updateRelationAction(
  relationId: string,
  _state: RelationActionState,
  formData: FormData,
): Promise<RelationActionState> {
  try {
    const result = await apiFetch<{ ok: boolean; worldId: string }>(`/api/relations/${relationId}`, { body: formData, method: "PATCH" });
    revalidateRelationPaths(result.worldId);
    return { ok: true };
  } catch (error) {
    return actionError<RelationActionState>(error);
  }
}

export async function deleteRelationAction(relationId: string): Promise<RelationActionState> {
  try {
    const result = await apiFetch<{ ok: boolean; worldId: string }>(`/api/relations/${relationId}`, { method: "DELETE" });
    revalidateRelationPaths(result.worldId);
    return { ok: true };
  } catch (error) {
    return actionError<RelationActionState>(error);
  }
}

import "server-only";

import type { RelationGraphData } from "@/features/relations/types";
import { apiFetch } from "@/lib/api-fetch";

export async function getDefaultRelationWorld(userId?: string) {
  void userId;
  return apiFetch<{ id: string } | null>("/api/relations");
}

export async function getRelationGraphData(
  worldId: string,
  options: { centerCharacterId?: string } = {},
): Promise<RelationGraphData> {
  const params = new URLSearchParams({ worldId });
  if (options.centerCharacterId) params.set("centerCharacterId", options.centerCharacterId);
  return apiFetch<RelationGraphData>(`/api/relations?${params}`);
}

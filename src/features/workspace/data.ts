import "server-only";

import { apiFetch } from "@/lib/api-fetch";

export async function getWorkspaceData(userId: string) {
  void userId;
  return apiFetch<any>("/api/workspace");
}

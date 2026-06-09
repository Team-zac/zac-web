import "server-only";

import type { WorldRole } from "@prisma/client";
import type { WorldCardData } from "@/features/worlds/types";
import { apiFetch } from "@/lib/api-fetch";

type AnyRecord = Record<string, any>;
type WorldListResult = { page: number; pageCount: number; total: number; worlds: WorldCardData[] };
type WorldDetail = AnyRecord & {
  affiliations: AnyRecord[];
  characters: AnyRecord[];
  works: AnyRecord[];
  worldTags: { tag: AnyRecord }[];
};
type WorldEdit = AnyRecord & { worldTags: { tag: AnyRecord }[] };
type ShareUser = { email: string | null; id: string; image: string | null; name: string | null };
type WorldShare = {
  id: string;
  invites: { email: string; id: string; role: WorldRole }[];
  members: { id: string; role: WorldRole; user: ShareUser }[];
  owner: ShareUser;
  title: string;
};

export async function getMyWorlds(userId: string, pageInput: number | string = 1) {
  void userId;
  return apiFetch<WorldListResult>(`/api/worlds?scope=my&page=${encodeURIComponent(String(pageInput))}`);
}

export async function getPublicWorlds({
  page,
  query,
  sort,
}: {
  page: number;
  query: string;
  sort: "popular" | "latest";
}) {
  const params = new URLSearchParams({ page: String(page), scope: "public", sort });
  if (query) params.set("q", query);
  return apiFetch<WorldListResult>(`/api/worlds?${params}`);
}

export async function getWorldDetail(worldId: string) {
  return apiFetch<WorldDetail | null>(`/api/worlds/${worldId}?view=detail`);
}

export async function getWorldForEdit(worldId: string, userId: string) {
  void userId;
  return apiFetch<WorldEdit | null>(`/api/worlds/${worldId}?view=edit`);
}

export async function getWorldShareData(worldId: string, userId: string) {
  void userId;
  return apiFetch<WorldShare | null>(`/api/worlds/${worldId}?view=share`);
}

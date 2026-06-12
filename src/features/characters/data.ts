import "server-only";

import type { CharacterCardData } from "@/features/characters/types";
import { apiFetch } from "@/lib/api-fetch";

type AnyRecord = Record<string, any>;
type CharacterListResult = { characters: CharacterCardData[]; page: number; pageCount: number; total: number };
type CharacterWorldOption = {
  affiliations: { color: string | null; description: string | null; id: string; name: string; type: string }[];
  description: string | null;
  id: string;
  tags?: string[];
  title: string;
  worldTags: { tag: { name: string } }[];
};
type CharacterDetail = AnyRecord & {
  affiliations: AnyRecord[];
  characterTags: { tag: AnyRecord }[];
  sourceRelations: AnyRecord[];
  targetRelations: AnyRecord[];
  workCharacters: AnyRecord[];
};
type CharacterEdit = AnyRecord & {
  affiliations: AnyRecord[];
  characterTags: { tag: AnyRecord }[];
  world: AnyRecord & {
    affiliations: { color: string | null; description: string | null; id: string; name: string; type: string }[];
    worldTags: { tag: { name: string } }[];
  };
};

export async function getEditableWorlds(userId: string) {
  void userId;
  return apiFetch<CharacterWorldOption[]>("/api/characters?scope=editable-worlds");
}

export async function getMyCharacters(userId: string, pageInput: number | string = 1) {
  void userId;
  return apiFetch<CharacterListResult>(`/api/characters?scope=my&page=${encodeURIComponent(String(pageInput))}`);
}

export async function getPublicCharacters({
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
  return apiFetch<CharacterListResult>(`/api/characters?${params}`);
}

export async function getCharacterDetail(characterId: string) {
  return apiFetch<CharacterDetail | null>(`/api/characters/${characterId}?view=detail`);
}

export async function getCharacterForEdit(characterId: string, userId: string) {
  void userId;
  return apiFetch<CharacterEdit | null>(`/api/characters/${characterId}?view=edit`);
}

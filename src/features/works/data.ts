import "server-only";

import type { WorkChapter, WorkCharacterRole } from "@prisma/client";
import type { WorkCardData } from "@/features/works/types";
import { apiFetch } from "@/lib/api-fetch";

type AnyRecord = Record<string, any>;
type WorkListResult = { page?: number; pageCount: number; total: number; works: WorkCardData[] };
type WorkWorldOption = {
  affiliations: { description: string | null; id: string; name: string; type: string }[];
  characters: { alias: string | null; id: string; name: string; summary: string | null }[];
  id: string;
  title: string;
  worldTags?: { tag: AnyRecord }[];
};
type WorkDetail = AnyRecord & {
  chapters: AnyRecord[];
  workAffiliations: AnyRecord[];
  workCharacters: (AnyRecord & { role: WorkCharacterRole })[];
  workTags: { tag: AnyRecord }[];
  world: AnyRecord & { members?: AnyRecord[] };
};
type WorkEdit = AnyRecord & {
  workAffiliations: AnyRecord[];
  workCharacters: AnyRecord[];
  workTags: { tag: AnyRecord }[];
  world: AnyRecord & WorkWorldOption;
};
type ChapterEditorData = AnyRecord & { chapters: WorkChapter[]; world: AnyRecord };
type ReaderData = AnyRecord & {
  chapters: { id: string; number: number; title: string }[];
  currentChapter: { body: string; id: string; number: number; title: string } | null;
  id: string;
  summary: string | null;
  title: string;
  world: { title: string };
};

export async function getEditableWorkWorlds(userId: string) {
  void userId;
  return apiFetch<WorkWorldOption[]>("/api/works?scope=editable-worlds");
}

export async function getMyWorks(userId: string, pageInput: number | string = 1) {
  void userId;
  return apiFetch<WorkListResult>(`/api/works?scope=my&page=${encodeURIComponent(String(pageInput))}`);
}

export async function getPublicWorks({
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
  return apiFetch<WorkListResult>(`/api/works?${params}`);
}

export async function getWorkDetail(workId: string) {
  return apiFetch<WorkDetail | null>(`/api/works/${workId}?view=detail`);
}

export async function getWorkForEdit(workId: string, userId: string) {
  void userId;
  return apiFetch<WorkEdit | null>(`/api/works/${workId}?view=edit`);
}

export async function getChapterEditorData(workId: string, userId: string) {
  void userId;
  return apiFetch<ChapterEditorData | null>(`/api/works/${workId}?view=chapters`);
}

export async function getWorkReaderData(workId: string, chapterNumberInput?: number | string) {
  const params = new URLSearchParams({ view: "reader" });
  if (chapterNumberInput) params.set("chapter", String(chapterNumberInput));
  return apiFetch<ReaderData | null>(`/api/works/${workId}?${params}`);
}

import { PublishStatus, Visibility, WorkCharacterRole, WorkType } from "@prisma/client";

import type { WorkAffiliationInput, WorkCharacterInput } from "@/features/works/types";
import { normalizeTags } from "@/lib/tags";

function text(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function optional(value: string) {
  return value || null;
}

function parseCharacters(value: string): WorkCharacterInput[] {
  if (!value) return [];
  let raw: unknown;
  try {
    raw = JSON.parse(value);
  } catch {
    throw new Error("등장인물 연결 정보를 확인해주세요.");
  }
  if (!Array.isArray(raw)) throw new Error("등장인물 연결 정보를 확인해주세요.");
  const items = raw.map((item) => {
    const source = item && typeof item === "object" ? item as Record<string, unknown> : {};
    const role = Object.values(WorkCharacterRole).includes(source.role as WorkCharacterRole)
      ? source.role as WorkCharacterRole
      : WorkCharacterRole.SUPPORTING;
    return {
      characterId: String(source.characterId ?? ""),
      note: String(source.note ?? "").trim(),
      role,
    };
  }).filter((item) => item.characterId);
  if (new Set(items.map(({ characterId }) => characterId)).size !== items.length) {
    throw new Error("같은 등장인물을 중복 연결할 수 없습니다.");
  }
  return items;
}

function parseAffiliations(value: string): WorkAffiliationInput[] {
  if (!value) return [];
  let raw: unknown;
  try {
    raw = JSON.parse(value);
  } catch {
    throw new Error("등장소속 연결 정보를 확인해주세요.");
  }
  if (!Array.isArray(raw)) throw new Error("등장소속 연결 정보를 확인해주세요.");
  const items = raw.map((item) => {
    const source = item && typeof item === "object" ? item as Record<string, unknown> : {};
    return {
      affiliationId: String(source.affiliationId ?? ""),
      note: String(source.note ?? "").trim(),
    };
  }).filter((item) => item.affiliationId);
  if (new Set(items.map(({ affiliationId }) => affiliationId)).size !== items.length) {
    throw new Error("같은 등장소속을 중복 연결할 수 없습니다.");
  }
  return items;
}

function summarize(markdown: string) {
  return markdown
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^-\s+/gm, "")
    .replace(/`|\*\*/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 255);
}

export function parseWorkInput(formData: FormData, fallbackWorldId?: string) {
  const title = text(formData, "title");
  const worldId = text(formData, "worldId") || fallbackWorldId || "";
  if (!title) throw new Error("창작물 제목을 입력해주세요.");
  if (!worldId) throw new Error("세계관을 선택해주세요.");

  const typeValue = text(formData, "type");
  const visibilityValue = text(formData, "visibility");
  const publishStatusValue = text(formData, "publishStatus");
  const description = text(formData, "description");

  return {
    affiliations: parseAffiliations(text(formData, "affiliations")),
    characters: parseCharacters(text(formData, "characters")),
    coverImageUrl: optional(text(formData, "coverImageUrl")),
    description: optional(description),
    publishStatus: Object.values(PublishStatus).includes(publishStatusValue as PublishStatus)
      ? publishStatusValue as PublishStatus
      : PublishStatus.DRAFT,
    requestedOfficial: text(formData, "isOfficial") === "true",
    summary: optional(summarize(description)),
    tags: normalizeTags(text(formData, "tags")),
    title: title.slice(0, 160),
    type: Object.values(WorkType).includes(typeValue as WorkType) ? typeValue as WorkType : WorkType.NOVEL,
    visibility: Object.values(Visibility).includes(visibilityValue as Visibility)
      ? visibilityValue as Visibility
      : Visibility.PRIVATE,
    worldId,
  };
}

export function parseChapterInput(formData: FormData) {
  const title = text(formData, "title");
  const body = text(formData, "body");
  if (!title) throw new Error("챕터 제목을 입력해주세요.");
  const visibilityValue = text(formData, "visibility");
  const publishStatusValue = text(formData, "publishStatus");
  return {
    body,
    publishStatus: Object.values(PublishStatus).includes(publishStatusValue as PublishStatus)
      ? publishStatusValue as PublishStatus
      : PublishStatus.DRAFT,
    title: title.slice(0, 160),
    visibility: Object.values(Visibility).includes(visibilityValue as Visibility)
      ? visibilityValue as Visibility
      : Visibility.PRIVATE,
  };
}

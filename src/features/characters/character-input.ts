import { CharacterAffiliationStatus, Visibility } from "@prisma/client";

import type { CharacterAffiliationInput } from "@/features/characters/types";
import { normalizeTags } from "@/lib/tags";

function text(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function optional(value: string) {
  return value || null;
}

function parseAffiliations(value: string): CharacterAffiliationInput[] {
  if (!value) return [];
  let raw: unknown;
  try {
    raw = JSON.parse(value);
  } catch {
    throw new Error("소속 연결 정보를 확인해주세요.");
  }
  if (!Array.isArray(raw)) throw new Error("소속 연결 정보를 확인해주세요.");

  const affiliations = raw.map((item) => {
    const source = item && typeof item === "object" ? item as Record<string, unknown> : {};
    const status = Object.values(CharacterAffiliationStatus).includes(
      source.status as CharacterAffiliationStatus,
    )
      ? source.status as CharacterAffiliationStatus
      : CharacterAffiliationStatus.CURRENT;
    return {
      affiliationId: String(source.affiliationId ?? ""),
      endedLabel: String(source.endedLabel ?? "").trim(),
      isPrimary: Boolean(source.isPrimary),
      note: String(source.note ?? "").trim(),
      rank: String(source.rank ?? "").trim(),
      startedLabel: String(source.startedLabel ?? "").trim(),
      status,
      title: String(source.title ?? "").trim(),
    };
  }).filter((item) => item.affiliationId);

  if (new Set(affiliations.map(({ affiliationId }) => affiliationId)).size !== affiliations.length) {
    throw new Error("같은 소속을 중복 연결할 수 없습니다.");
  }
  if (affiliations.filter(({ isPrimary }) => isPrimary).length > 1) {
    throw new Error("대표 소속은 하나만 선택할 수 있습니다.");
  }
  return affiliations;
}

export function parseCharacterInput(formData: FormData) {
  const name = text(formData, "name");
  const worldId = text(formData, "worldId");
  if (!name) throw new Error("캐릭터 이름을 입력해주세요.");
  if (!worldId) throw new Error("세계관을 선택해주세요.");

  const visibilityValue = text(formData, "visibility");
  const visibility = Object.values(Visibility).includes(visibilityValue as Visibility)
    ? visibilityValue as Visibility
    : Visibility.PRIVATE;

  return {
    affiliations: parseAffiliations(text(formData, "affiliations")),
    alias: optional(text(formData, "alias")),
    background: optional(text(formData, "background")),
    description: optional(text(formData, "description")),
    name: name.slice(0, 120),
    personality: optional(text(formData, "personality")),
    profileImageUrl: optional(text(formData, "profileImageUrl")),
    summary: optional(text(formData, "summary").slice(0, 255)),
    tags: normalizeTags(text(formData, "tags")),
    visibility,
    worldId,
  };
}

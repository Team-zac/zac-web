import { RelationDirection, RelationStatus, Visibility } from "@prisma/client";

function text(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function optional(value: string) {
  return value || null;
}

export function parseRelationInput(formData: FormData, fallbackWorldId?: string) {
  const worldId = text(formData, "worldId") || fallbackWorldId || "";
  const sourceCharacterId = text(formData, "sourceCharacterId");
  const targetCharacterId = text(formData, "targetCharacterId");
  const name = text(formData, "name");

  if (!worldId) throw new Error("세계관을 선택해주세요.");
  if (!sourceCharacterId || !targetCharacterId) throw new Error("출발 캐릭터와 대상 캐릭터를 선택해주세요.");
  if (sourceCharacterId === targetCharacterId) throw new Error("출발 캐릭터와 대상 캐릭터는 서로 달라야 합니다.");
  if (!name) throw new Error("관계명을 입력해주세요.");

  const directionValue = text(formData, "direction");
  const statusValue = text(formData, "status");
  const visibilityValue = text(formData, "visibility");

  return {
    contextAffiliationId: optional(text(formData, "contextAffiliationId")),
    description: optional(text(formData, "description")),
    direction: Object.values(RelationDirection).includes(directionValue as RelationDirection)
      ? directionValue as RelationDirection
      : RelationDirection.DIRECTED,
    name: name.slice(0, 120),
    sourceCharacterId,
    status: Object.values(RelationStatus).includes(statusValue as RelationStatus)
      ? statusValue as RelationStatus
      : RelationStatus.ACTIVE,
    targetCharacterId,
    visibility: Object.values(Visibility).includes(visibilityValue as Visibility)
      ? visibilityValue as Visibility
      : Visibility.PRIVATE,
    worldId,
  };
}

import { AffiliationType, Visibility } from "@prisma/client";

function text(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function optional(value: string) {
  return value || null;
}

export function parseAffiliationInput(formData: FormData) {
  const name = text(formData, "name");
  const worldId = text(formData, "worldId");
  if (!name) throw new Error("소속 이름을 입력해주세요.");
  if (!worldId) throw new Error("세계관을 선택해주세요.");

  const typeValue = text(formData, "type");
  const visibilityValue = text(formData, "visibility");
  const color = text(formData, "color");
  if (color && !/^#[0-9a-fA-F]{6}$/.test(color)) {
    throw new Error("대표 색상은 #E100FF 형식으로 입력해주세요.");
  }

  return {
    color: optional(color.toUpperCase()),
    description: optional(text(formData, "description")),
    name: name.slice(0, 120),
    parentId: optional(text(formData, "parentId")),
    symbolImageUrl: optional(text(formData, "symbolImageUrl")),
    type: Object.values(AffiliationType).includes(typeValue as AffiliationType)
      ? typeValue as AffiliationType
      : AffiliationType.OTHER,
    visibility: Object.values(Visibility).includes(visibilityValue as Visibility)
      ? visibilityValue as Visibility
      : Visibility.PRIVATE,
    worldId,
  };
}

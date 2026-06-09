import { Visibility } from "@prisma/client";

import { normalizeTags } from "@/lib/tags";

export type WorldInput = {
  coverImageUrl: string | null;
  description: string | null;
  genre: string | null;
  slug: string;
  tags: string[];
  title: string;
  visibility: Visibility;
};

function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function normalizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9가-힣-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 160);
}

export function parseWorldInput(formData: FormData): WorldInput {
  const title = readString(formData, "title");
  const slug = normalizeSlug(readString(formData, "slug"));
  const visibilityValue = readString(formData, "visibility").toUpperCase();

  if (!title || title.length > 120) {
    throw new Error("세계관 제목은 1자 이상 120자 이하로 입력해주세요.");
  }

  if (!slug) {
    throw new Error("URL 슬러그를 입력해주세요.");
  }

  if (!Object.values(Visibility).includes(visibilityValue as Visibility)) {
    throw new Error("공개 범위를 확인해주세요.");
  }

  const coverImageUrl = readString(formData, "coverImageUrl");
  if (coverImageUrl) {
    try {
      new URL(coverImageUrl);
    } catch {
      throw new Error("커버 이미지 URL 형식을 확인해주세요.");
    }
  }

  return {
    coverImageUrl: coverImageUrl || null,
    description: readString(formData, "description") || null,
    genre: readString(formData, "genre").slice(0, 80) || null,
    slug,
    tags: normalizeTags(readString(formData, "tags"), { limit: 12 }),
    title,
    visibility: visibilityValue as Visibility,
  };
}

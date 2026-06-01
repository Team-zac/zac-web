export type NormalizeTagsOptions = {
  limit?: number;
};

const tagSeparatorPattern = /[\s,]+/;

export function normalizeTag(value: string) {
  return value
    .replace(/^#+/, "")
    .trim()
    .toLocaleLowerCase("ko-KR");
}

export function normalizeTags(value: string, options: NormalizeTagsOptions = {}) {
  const limit = options.limit ?? 20;
  return Array.from(
    new Set(
      value
        .split(tagSeparatorPattern)
        .map(normalizeTag)
        .filter(Boolean),
    ),
  ).slice(0, limit);
}

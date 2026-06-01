export const DEFAULT_PAGE_SIZE = 15;

export function normalizePage(value: string | number | null | undefined) {
  const parsed = typeof value === "number" ? value : Number.parseInt(value ?? "1", 10);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 1;
}

export function pageCount(total: number, pageSize = DEFAULT_PAGE_SIZE) {
  return Math.max(1, Math.ceil(total / pageSize));
}

export function pageOffset(page: number, pageSize = DEFAULT_PAGE_SIZE) {
  return (normalizePage(page) - 1) * pageSize;
}

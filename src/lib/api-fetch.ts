import { cookies, headers } from "next/headers";

export class ApiFetchError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiFetchError";
    this.status = status;
  }
}

function revive(_key: string, value: unknown) {
  if (value && typeof value === "object" && "$bigint" in value) {
    return BigInt(String((value as { $bigint: string }).$bigint));
  }
  return value;
}

function replacer(_key: string, value: unknown) {
  if (typeof value === "bigint") return { $bigint: value.toString() };
  return value;
}

export function apiJson(data: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(data, replacer), {
    ...init,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...init?.headers,
    },
  });
}

export function apiError(error: unknown, status = 400) {
  const message = error instanceof Error ? error.message : "요청을 처리할 수 없습니다.";
  return apiJson({ error: message }, { status });
}

async function apiOrigin() {
  const headerStore = await headers();
  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host") ?? "localhost:3000";
  const proto = headerStore.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}`;
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const cookieStore = await cookies();
  const response = await fetch(`${await apiOrigin()}${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      cookie: cookieStore.toString(),
      ...init.headers,
    },
  });
  const text = await response.text();
  const payload = text ? JSON.parse(text, revive) : null;
  if (!response.ok) {
    const message = payload && typeof payload === "object" && "error" in payload
      ? String((payload as { error: unknown }).error)
      : "요청을 처리할 수 없습니다.";
    throw new ApiFetchError(message, response.status);
  }
  return payload as T;
}

export async function readJson<T>(request: Request): Promise<T> {
  return await request.json() as T;
}

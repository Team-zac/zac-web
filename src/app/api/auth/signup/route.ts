import { hash } from "bcryptjs";

import { apiError, apiJson } from "@/lib/api-fetch";
import { prisma } from "@/server/db";

function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const name = readString(formData, "name");
    const email = readString(formData, "email").toLowerCase();
    const password = readString(formData, "password");
    const passwordConfirm = readString(formData, "passwordConfirm");
    if (!name || !email || password.length < 8 || password !== passwordConfirm) {
      return apiJson({ error: "invalid" }, { status: 400 });
    }
    const existingUser = await prisma.user.findUnique({ where: { email }, select: { id: true } });
    if (existingUser) return apiJson({ error: "exists" }, { status: 409 });
    await prisma.user.create({ data: { email, name, passwordHash: await hash(password, 12) } });
    return apiJson({ ok: true });
  } catch (error) {
    return apiError(error, 400);
  }
}

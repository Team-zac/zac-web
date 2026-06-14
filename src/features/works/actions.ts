"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import type { WorkActionState } from "@/features/works/types";
import { apiFetch } from "@/lib/api-fetch";
import { actionError } from "@/server/errors";

export async function createWorkAction(
  _state: WorkActionState,
  formData: FormData,
): Promise<WorkActionState> {
  try {
    const work = await apiFetch<{ id: string; worldId: string }>("/api/works", { body: formData, method: "POST" });
    revalidatePath("/works");
    revalidatePath(`/worlds/${work.worldId}`);
    redirect(`/works/${work.id}/chapters`);
  } catch (error) {
    return actionError<WorkActionState>(error);
  }
}

export async function updateWorkAction(
  workId: string,
  _state: WorkActionState,
  formData: FormData,
): Promise<WorkActionState> {
  try {
    const work = await apiFetch<{ id: string; worldId: string }>(`/api/works/${workId}`, { body: formData, method: "PATCH" });
    revalidatePath("/works");
    revalidatePath(`/works/${workId}`);
    revalidatePath(`/worlds/${work.worldId}`);
    redirect(`/works/${workId}`);
  } catch (error) {
    return actionError<WorkActionState>(error);
  }
}

export async function deleteWorksAction(workIds: string[]) {
  await apiFetch("/api/works", {
    body: JSON.stringify({ workIds }),
    headers: { "content-type": "application/json" },
    method: "DELETE",
  });
  revalidatePath("/works");
}

export async function saveChapterAction(workId: string, chapterId: string, formData: FormData) {
  await apiFetch(`/api/works/${workId}/chapters/${chapterId}`, { body: formData, method: "PATCH" });
  revalidatePath(`/works/${workId}/chapters`);
}

export async function addChapterAction(workId: string) {
  await apiFetch(`/api/works/${workId}/chapters`, { method: "POST" });
  revalidatePath(`/works/${workId}/chapters`);
}

export async function deleteChapterAction(workId: string, chapterId: string) {
  await apiFetch(`/api/works/${workId}/chapters/${chapterId}`, { method: "DELETE" });
  revalidatePath(`/works/${workId}/chapters`);
}

export async function publishWorkAction(workId: string) {
  await apiFetch(`/api/works/${workId}/publish`, { method: "POST" });
  revalidatePath(`/works/${workId}`);
  revalidatePath(`/works/${workId}/chapters`);
  redirect(`/works/${workId}`);
}

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import type { CharacterActionState } from "@/features/characters/types";
import { apiFetch } from "@/lib/api-fetch";
import { actionError } from "@/server/errors";

export async function createCharacterAction(
  _state: CharacterActionState,
  formData: FormData,
): Promise<CharacterActionState> {
  try {
    const character = await apiFetch<{ id: string; worldId: string }>("/api/characters", { body: formData, method: "POST" });
    revalidatePath("/characters");
    revalidatePath(`/worlds/${character.worldId}`);
    redirect(`/characters/${character.id}`);
  } catch (error) {
    return actionError<CharacterActionState>(error);
  }
}

export async function updateCharacterAction(
  characterId: string,
  _state: CharacterActionState,
  formData: FormData,
): Promise<CharacterActionState> {
  try {
    const character = await apiFetch<{ id: string; worldId: string }>(`/api/characters/${characterId}`, { body: formData, method: "PATCH" });
    revalidatePath("/characters");
    revalidatePath(`/characters/${characterId}`);
    revalidatePath(`/worlds/${character.worldId}`);
    redirect(`/characters/${characterId}`);
  } catch (error) {
    return actionError<CharacterActionState>(error);
  }
}

export async function deleteCharactersAction(characterIds: string[]) {
  await apiFetch("/api/characters", {
    body: JSON.stringify({ characterIds }),
    headers: { "content-type": "application/json" },
    method: "DELETE",
  });
  revalidatePath("/characters");
}

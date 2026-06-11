"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import type { AffiliationActionState } from "@/features/affiliations/types";
import { apiFetch } from "@/lib/api-fetch";
import { actionError } from "@/server/errors";

export async function createAffiliationAction(
  _state: AffiliationActionState,
  formData: FormData,
): Promise<AffiliationActionState> {
  try {
    const affiliation = await apiFetch<{ id: string; worldId: string }>("/api/affiliations", { body: formData, method: "POST" });
    revalidatePath("/affiliations");
    revalidatePath(`/worlds/${affiliation.worldId}`);
    redirect(`/affiliations/${affiliation.id}`);
  } catch (error) {
    return actionError<AffiliationActionState>(error);
  }
}

export async function updateAffiliationAction(
  affiliationId: string,
  _state: AffiliationActionState,
  formData: FormData,
): Promise<AffiliationActionState> {
  try {
    const affiliation = await apiFetch<{ id: string; worldId: string }>(`/api/affiliations/${affiliationId}`, { body: formData, method: "PATCH" });
    revalidatePath("/affiliations");
    revalidatePath(`/affiliations/${affiliationId}`);
    revalidatePath(`/worlds/${affiliation.worldId}`);
    redirect(`/affiliations/${affiliationId}`);
  } catch (error) {
    return actionError<AffiliationActionState>(error);
  }
}

export async function deleteAffiliationsAction(affiliationIds: string[]) {
  await apiFetch("/api/affiliations", {
    body: JSON.stringify({ affiliationIds }),
    headers: { "content-type": "application/json" },
    method: "DELETE",
  });
  revalidatePath("/affiliations");
}

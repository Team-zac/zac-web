"use server";

import { redirect } from "next/navigation";

import { ApiFetchError, apiFetch } from "@/lib/api-fetch";

export async function signUpAction(formData: FormData) {
  try {
    await apiFetch("/api/auth/signup", { body: formData, method: "POST" });
  } catch (error) {
    if (error instanceof ApiFetchError && error.status === 409) redirect("/signup?error=exists");
    redirect("/signup?error=invalid");
  }
  redirect("/login?created=1");
}

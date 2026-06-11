"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export type UpdateProfileInput = {
  display_name?: string | null;
  phone?: string | null;
};

export type UpdateProfileResult = { ok: true } | { ok: false; error: string };

export async function updateProfile(
  input: UpdateProfileInput
): Promise<UpdateProfileResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sin sesión activa." };

  const patch: { display_name?: string | null; phone?: string | null } = {};
  if (input.display_name !== undefined) {
    const name = input.display_name?.trim() ?? "";
    patch.display_name = name || null;
  }
  if (input.phone !== undefined) {
    const phone = input.phone?.trim() ?? "";
    patch.phone = phone || null;
  }

  if (Object.keys(patch).length === 0) {
    return { ok: false, error: "Nada que actualizar." };
  }

  const { error } = await supabase
    .from("profiles")
    .update(patch)
    .eq("id", user.id);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/mi-cuenta");
  return { ok: true };
}

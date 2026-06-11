"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import {
  type ConfigKey,
  validateConfig,
} from "@/lib/config";

export type UpdateConfigResult = { ok: true } | { ok: false; error: string };

export async function updateConfig(
  clave: ConfigKey,
  valor: unknown
): Promise<UpdateConfigResult> {
  const validationError = validateConfig(clave, valor);
  if (validationError) return { ok: false, error: validationError };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sin sesión." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.role !== "admin") {
    return { ok: false, error: "Solo admin puede modificar la configuración." };
  }

  const { error } = await supabase
    .from("config")
    .upsert(
      { clave, valor: valor as never, updated_at: new Date().toISOString() },
      { onConflict: "clave" }
    );

  if (error) return { ok: false, error: error.message };
  revalidatePath("/gestion/admin/settings");
  revalidatePath("/catalogo");
  return { ok: true };
}

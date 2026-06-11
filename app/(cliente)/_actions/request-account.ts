"use server";

import { headers } from "next/headers";

import { createClient } from "@/lib/supabase/server";

export type RequestAccountResult = { ok: true } | { ok: false; error: string };

/**
 * Promueve una sesión anónima a permanente añadiendo email.
 * Supabase envía un enlace de confirmación al email; al hacer clic, el
 * usuario se conserva con el mismo `id`, pero ya no es anónimo.
 */
export async function requestAccount(email: string): Promise<RequestAccountResult> {
  const clean = email.trim();
  if (!clean) return { ok: false, error: "Introduce un email válido." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sin sesión activa." };

  if (!user.is_anonymous) {
    return { ok: false, error: "Ya tienes cuenta creada." };
  }

  const h = await headers();
  const origin =
    h.get("origin") ?? `https://${h.get("host") ?? "localhost:3000"}`;

  const { error } = await supabase.auth.updateUser(
    { email: clean },
    { emailRedirectTo: `${origin}/auth/callback?next=/mi-cuenta` }
  );
  if (error) return { ok: false, error: error.message };

  return { ok: true };
}

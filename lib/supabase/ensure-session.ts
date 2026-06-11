import { createClient } from "@/lib/supabase/server";

/**
 * Garantiza sesión Supabase desde un **server action** (NO desde un server
 * component — los server components no pueden setear cookies y la creación
 * de sesión fallaría silenciosamente).
 *
 * - Si ya hay sesión (anónima o real), la devuelve.
 * - Si no, intenta crear una anónima. Requiere "Anonymous sign-ins" habilitado
 *   en Dashboard → Authentication → Sign In / Providers.
 */
export async function ensureClientSession() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) return { user, supabase };

  const { data, error } = await supabase.auth.signInAnonymously();
  if (error || !data.user) {
    const detail = error?.message ?? "respuesta vacía";
    if (/anonymous/i.test(detail) && /disabled/i.test(detail)) {
      throw new Error(
        "Las sesiones anónimas están desactivadas en Supabase. Activa 'Anonymous sign-ins' en Authentication → Providers."
      );
    }
    throw new Error(`No se pudo crear sesión anónima: ${detail}`);
  }
  return { user: data.user, supabase };
}

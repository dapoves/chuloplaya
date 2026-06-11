"use server";

import { ensureClientSession } from "@/lib/supabase/ensure-session";

/** Crea la sesión anónima si aún no existe. Llamado desde el cliente al montar el layout. */
export async function initSession(): Promise<void> {
  try {
    await ensureClientSession();
  } catch {
    // silencioso — si falla, el usuario puede seguir navegando sin sesión
  }
}

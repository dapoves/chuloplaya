import { createClient } from "./client";

/**
 * Crea un cliente Supabase de navegador y **autentica el socket de Realtime**
 * con el JWT del usuario actual antes de suscribirse a ningún canal.
 *
 * Sin esto, `postgres_changes` sobre tablas con RLS no entrega nada: el socket
 * arrancaría solo con la apikey anónima y la política (que usa `auth.uid()` /
 * `get_my_role()`) descartaría todos los eventos.
 *
 * Devuelve el mismo cliente para poder hacer `removeChannel` luego.
 */
export async function createRealtimeClient() {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  await supabase.realtime.setAuth(session?.access_token ?? null);
  return supabase;
}

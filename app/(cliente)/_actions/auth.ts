"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export type AuthResult =
  | { ok: true }
  | { ok: false; error: string }
  | { ok: false; redirect: string };

/** Origen absoluto de la app para construir el emailRedirectTo del magic link. */
async function siteOrigin() {
  const h = await headers();
  const origin = h.get("origin");
  if (origin) return origin;
  const host = h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}`;
}

function callbackUrl(origin: string) {
  // Sin query: el callback ya redirige a /mi-cuenta por defecto. Mantenerlo
  // limpio asegura que casa con la allowlist de Supabase (un query no incluido
  // en la lista hace que Supabase caiga al "Site URL" — p. ej. localhost).
  return `${origin}/auth/callback`;
}

/**
 * Crea una cuenta real a partir de la sesión anónima actual.
 * Nombre, teléfono y email son obligatorios. Guarda nombre/teléfono en el
 * perfil (se conservan tras confirmar porque el `id` no cambia) y envía un
 * magic link para verificar el email.
 */
export async function createAccount(input: {
  email: string;
  name: string;
  phone: string;
}): Promise<AuthResult> {
  const email = input.email.trim();
  const name = input.name.trim();
  const phone = input.phone.trim();

  if (!name) return { ok: false, error: "Introduce tu nombre." };
  if (!phone) return { ok: false, error: "Introduce tu teléfono." };
  if (!email) return { ok: false, error: "Introduce tu email." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sin sesión activa." };
  if (!user.is_anonymous) return { ok: false, error: "Ya tienes una cuenta." };

  const { data: staffRole } = await supabase.rpc("get_staff_role_by_email", {
    lookup_email: email,
  });
  if (staffRole) {
    return {
      ok: false,
      redirect: `/gestion/login?email=${encodeURIComponent(email)}`,
    };
  }

  // Guardamos nombre/teléfono antes de promover (mismo id tras confirmar).
  const { error: profileError } = await supabase
    .from("profiles")
    .update({ display_name: name, phone })
    .eq("id", user.id);
  if (profileError) return { ok: false, error: profileError.message };

  const origin = await siteOrigin();
  const { error } = await supabase.auth.updateUser(
    { email },
    { emailRedirectTo: callbackUrl(origin) }
  );
  if (error) return { ok: false, error: friendlyAuthError(error) };

  return { ok: true };
}

/**
 * Inicia sesión / crea cuenta con Google (OAuth, flujo PKCE).
 *
 * - `intent: "create"` con sesión anónima → `linkIdentity`: enlaza la identidad
 *   de Google al usuario actual, conservando carrito e historial (mismo id).
 * - `intent: "login"` o sin sesión anónima → `signInWithOAuth`: entra en la
 *   cuenta de Google (la crea si no existe), reemplazando la sesión anónima.
 *
 * Devuelve la URL de Google en `redirect` para que el cliente navegue
 * (`skipBrowserRedirect`); la cookie del verifier PKCE queda escrita por esta
 * server action y `/auth/callback` la canjea por sesión.
 */
export async function signInWithGoogle(
  intent: "create" | "login"
): Promise<AuthResult> {
  const supabase = await createClient();
  const redirectTo = callbackUrl(await siteOrigin());

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (intent === "create" && user?.is_anonymous) {
    const { data, error } = await supabase.auth.linkIdentity({
      provider: "google",
      options: { redirectTo, skipBrowserRedirect: true },
    });
    if (error) return { ok: false, error: googleAuthError(error) };
    if (!data?.url) return { ok: false, error: "No se pudo conectar con Google." };
    return { ok: false, redirect: data.url };
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo, skipBrowserRedirect: true },
  });
  if (error) return { ok: false, error: googleAuthError(error) };
  if (!data?.url) return { ok: false, error: "No se pudo conectar con Google." };
  return { ok: false, redirect: data.url };
}

/** Mensajes claros para los fallos del flujo OAuth de Google. */
function googleAuthError(error: { code?: string; message?: string }): string {
  // El error real va al log del servidor para depurar.
  console.error("[signInWithGoogle]", error.code ?? "", error.message ?? error);
  const code = error.code ?? "";
  const msg = error.message?.toLowerCase() ?? "";
  if (code === "manual_linking_disabled" || msg.includes("manual linking")) {
    return "La conexión con Google aún no está activada. Activa “Manual linking” en Supabase.";
  }
  if (msg.includes("provider is not enabled") || msg.includes("validation_failed")) {
    return "Google no está habilitado como proveedor en Supabase.";
  }
  return "No hemos podido conectar con Google. Inténtalo de nuevo en un momento.";
}

/**
 * Inicia sesión en una cuenta existente enviando un magic link.
 * No crea usuario nuevo (`shouldCreateUser: false`): si el email no tiene
 * cuenta, devolvemos un mensaje genérico.
 */
export async function signInWithEmail(email: string): Promise<AuthResult> {
  const clean = email.trim();
  if (!clean) return { ok: false, error: "Introduce tu email." };

  const supabase = await createClient();

  const { data: staffRole } = await supabase.rpc("get_staff_role_by_email", {
    lookup_email: clean,
  });
  if (staffRole) {
    return {
      ok: false,
      redirect: `/gestion/login?email=${encodeURIComponent(clean)}`,
    };
  }

  const origin = await siteOrigin();
  const { error } = await supabase.auth.signInWithOtp({
    email: clean,
    options: {
      shouldCreateUser: false,
      emailRedirectTo: callbackUrl(origin),
    },
  });
  if (error) {
    return { ok: false, error: friendlyAuthError(error) };
  }

  return { ok: true };
}

/** Traduce errores de Supabase Auth a mensajes claros en español. */
function friendlyAuthError(error: { status?: number; message?: string }): string {
  const msg = error.message?.toLowerCase() ?? "";
  if (error.status === 429 || msg.includes("rate limit")) {
    return "Demasiados envíos en poco tiempo. Espera unos minutos e inténtalo de nuevo.";
  }
  if (msg.includes("signups not allowed") || msg.includes("not found")) {
    return "No hay ninguna cuenta con ese email. Usa “Crear cuenta”.";
  }
  return "No hemos podido enviar el enlace. Inténtalo de nuevo en un momento.";
}

/**
 * Cierra la sesión actual y vuelve al catálogo. El layout cliente creará
 * una nueva sesión anónima en cuanto se cargue.
 */
export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/catalogo");
}

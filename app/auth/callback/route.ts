import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";

/**
 * Destino de los magic links (crear cuenta / iniciar sesión).
 * Supabase redirige aquí con `?code=…`; lo intercambiamos por una sesión
 * (flujo PKCE) y mandamos al usuario a `next` (por defecto /mi-cuenta).
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/mi-cuenta";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/mi-cuenta?auth_error=1`);
}

import { type NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/middleware";

// Next.js 16: convención "proxy" (sustituye a "middleware").
export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Coincide con todas las rutas excepto:
     * - _next/static, _next/image (assets de Next)
     * - favicon.ico y archivos de imagen estáticos
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

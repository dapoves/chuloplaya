import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { GestionShell } from "./_components/gestion-shell";
import { logout } from "./actions";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Gestión · Chulo Playa",
};

export default async function GestionLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // El login tiene su propio layout (este wraps todo /gestion).
  // Si no hay usuario y NO estamos en /gestion/login, el proxy ya redirige.
  // Si llegamos aquí sin user es la propia página de login → render directo.
  if (!user) {
    return <div className="min-h-dvh bg-muted/40">{children}</div>;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role === "cliente") {
    await supabase.auth.signOut();
    redirect("/gestion/login");
  }

  return (
    <GestionShell
      email={user.email ?? ""}
      role={profile.role}
      logout={logout}
    >
      {children}
    </GestionShell>
  );
}

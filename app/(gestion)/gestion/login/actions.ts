"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export type LoginState = { error: string } | null;

export async function login(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Introduce email y contraseña." };
  }

  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !user) {
    return { error: "Credenciales incorrectas." };
  }

  // Solo colaboradores y admins pueden entrar a /gestion.
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role === "cliente") {
    await supabase.auth.signOut();
    return { error: "Esta cuenta no tiene acceso al panel de gestión." };
  }

  revalidatePath("/gestion", "layout");
  redirect("/gestion");
}

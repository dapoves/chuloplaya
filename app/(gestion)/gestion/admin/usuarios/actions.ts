"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/types/database.types";

type Role = Database["public"]["Enums"]["user_role"];

export type UserActionState = { error?: string; ok?: string } | null;

async function ensureAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, error: "Sin sesión." } as const;
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.role !== "admin") {
    return { supabase, error: "Solo admin." } as const;
  }
  return { supabase, error: null, callerId: user.id } as const;
}

export async function updateUser(
  userId: string,
  patch: {
    display_name?: string | null;
    phone?: string | null;
    role?: Role;
    is_fraudulent?: boolean;
  }
): Promise<UserActionState> {
  const { supabase, error: authError } = await ensureAdmin();
  if (authError) return { error: authError };

  const { error } = await supabase.rpc("admin_update_profile", {
    p_user_id: userId,
    p_display_name: patch.display_name ?? undefined,
    p_phone: patch.phone ?? undefined,
    p_role: patch.role,
    p_is_fraudulent: patch.is_fraudulent,
  });
  if (error) return { error: error.message };

  revalidatePath("/gestion/admin/usuarios");
  return { ok: "Actualizado." };
}

export async function inviteUser(
  _prev: UserActionState,
  formData: FormData
): Promise<UserActionState> {
  const { supabase, error: authError } = await ensureAdmin();
  if (authError) return { error: authError };

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const role = String(formData.get("role") ?? "") as Role;
  const displayName = String(formData.get("display_name") ?? "").trim() || null;

  if (!email) return { error: "Email requerido." };
  if (role !== "colaborador" && role !== "admin") {
    return { error: "Rol no válido." };
  }

  const { data, error } = await supabase.functions.invoke("admin-invite-user", {
    body: {
      email,
      role,
      display_name: displayName,
    },
  });

  if (error) {
    const ctx = (error as { context?: { body?: string } }).context;
    let msg = error.message;
    if (ctx?.body) {
      try {
        const parsed = JSON.parse(ctx.body) as { error?: string };
        if (parsed.error) msg = parsed.error;
      } catch {
        msg = ctx.body || msg;
      }
    }
    return { error: msg };
  }

  if (data && typeof data === "object" && "error" in data) {
    return { error: String((data as { error: string }).error) };
  }

  revalidatePath("/gestion/admin/usuarios");
  return { ok: `Invitación enviada a ${email}.` };
}

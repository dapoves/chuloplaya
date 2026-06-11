"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export type CategoryState = { error?: string; ok?: string } | null;

function toSlug(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

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
  return { supabase, error: null } as const;
}

export async function addCategory(
  _prev: CategoryState,
  formData: FormData
): Promise<CategoryState> {
  const { supabase, error: authError } = await ensureAdmin();
  if (authError) return { error: authError };

  const nombre = String(formData.get("nombre") ?? "").trim();
  if (!nombre) return { error: "Nombre requerido." };
  const slug = toSlug(nombre);
  if (!slug) return { error: "Nombre no válido." };

  const { data: existing } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (existing) return { error: "Ya existe una categoría con ese nombre." };

  const { data: maxOrden } = await supabase
    .from("categories")
    .select("orden")
    .order("orden", { ascending: false })
    .limit(1)
    .maybeSingle();
  const nextOrden = (maxOrden?.orden ?? 0) + 10;

  const { error } = await supabase
    .from("categories")
    .insert({ nombre, slug, orden: nextOrden, activo: true });
  if (error) return { error: error.message };

  revalidatePath("/gestion/admin/categorias");
  revalidatePath("/catalogo");
  return { ok: "Categoría creada." };
}

export async function updateCategory(
  categoryId: string,
  patch: { nombre?: string; activo?: boolean; orden?: number }
) {
  const { supabase, error: authError } = await ensureAdmin();
  if (authError) return { error: authError };

  const update: { nombre?: string; activo?: boolean; orden?: number; slug?: string } = {};
  if (patch.nombre !== undefined) {
    const cleanName = patch.nombre.trim();
    if (!cleanName) return { error: "Nombre requerido." };
    update.nombre = cleanName;
  }
  if (patch.activo !== undefined) update.activo = patch.activo;
  if (patch.orden !== undefined) update.orden = patch.orden;

  const { error } = await supabase.from("categories").update(update).eq("id", categoryId);
  if (error) return { error: error.message };

  revalidatePath("/gestion/admin/categorias");
  revalidatePath("/catalogo");
  return { ok: true };
}

export async function deleteCategory(categoryId: string) {
  const { supabase, error: authError } = await ensureAdmin();
  if (authError) return { error: authError };

  const { count } = await supabase
    .from("products")
    .select("id", { head: true, count: "exact" })
    .eq("category_id", categoryId);
  if ((count ?? 0) > 0) {
    return { error: "No puedes borrar una categoría con productos. Desactívala." };
  }

  const { error } = await supabase.from("categories").delete().eq("id", categoryId);
  if (error) return { error: error.message };

  revalidatePath("/gestion/admin/categorias");
  revalidatePath("/catalogo");
  return { ok: true };
}

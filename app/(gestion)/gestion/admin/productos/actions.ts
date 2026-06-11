"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export type ProductFormState = { error?: string; ok?: string } | null;

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

function parseForm(formData: FormData) {
  const nombre = String(formData.get("nombre") ?? "").trim();
  const slugRaw = String(formData.get("slug") ?? "").trim();
  const descripcion = String(formData.get("descripcion") ?? "").trim() || null;
  const precio = Number(formData.get("precio") ?? 0);
  const imagen_url = String(formData.get("imagen_url") ?? "").trim() || null;
  const category_id = String(formData.get("category_id") ?? "").trim() || null;
  const activo = formData.get("activo") === "on" || formData.get("activo") === "true";
  const slug = slugRaw ? toSlug(slugRaw) : toSlug(nombre);
  return { nombre, slug, descripcion, precio, imagen_url, category_id, activo };
}

function validate(data: ReturnType<typeof parseForm>): string | null {
  if (!data.nombre) return "El nombre es obligatorio.";
  if (data.nombre.length > 80) return "Nombre demasiado largo.";
  if (!Number.isFinite(data.precio) || data.precio < 0) return "Precio no válido.";
  return null;
}

export async function createProduct(
  _prev: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  const { supabase, error: authError } = await ensureAdmin();
  if (authError) return { error: authError };

  const data = parseForm(formData);
  const err = validate(data);
  if (err) return { error: err };

  // resolve categoria text (compatibilidad con catálogo cliente actual)
  let categoriaSlug: string | null = null;
  if (data.category_id) {
    const { data: cat } = await supabase
      .from("categories")
      .select("slug")
      .eq("id", data.category_id)
      .maybeSingle();
    categoriaSlug = cat?.slug ?? null;
  }

  const { error } = await supabase.from("products").insert({
    nombre: data.nombre,
    slug: data.slug,
    descripcion: data.descripcion,
    precio: data.precio,
    imagen_url: data.imagen_url,
    category_id: data.category_id,
    categoria: categoriaSlug,
    activo: data.activo,
  });

  if (error) return { error: error.message };

  revalidatePath("/gestion/admin/productos");
  revalidatePath("/catalogo");
  redirect("/gestion/admin/productos");
}

export async function updateProduct(
  productId: string,
  _prev: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  const { supabase, error: authError } = await ensureAdmin();
  if (authError) return { error: authError };

  const data = parseForm(formData);
  const err = validate(data);
  if (err) return { error: err };

  let categoriaSlug: string | null = null;
  if (data.category_id) {
    const { data: cat } = await supabase
      .from("categories")
      .select("slug")
      .eq("id", data.category_id)
      .maybeSingle();
    categoriaSlug = cat?.slug ?? null;
  }

  const { error } = await supabase
    .from("products")
    .update({
      nombre: data.nombre,
      slug: data.slug,
      descripcion: data.descripcion,
      precio: data.precio,
      imagen_url: data.imagen_url,
      category_id: data.category_id,
      categoria: categoriaSlug,
      activo: data.activo,
      updated_at: new Date().toISOString(),
    })
    .eq("id", productId);

  if (error) return { error: error.message };

  revalidatePath("/gestion/admin/productos");
  revalidatePath(`/gestion/admin/productos/${productId}`);
  revalidatePath("/catalogo");
  return { ok: "Producto actualizado." };
}

export async function deleteProduct(productId: string) {
  const { supabase, error: authError } = await ensureAdmin();
  if (authError) return { error: authError };

  // Soft delete si hay órdenes con este producto; hard delete si no.
  const { count } = await supabase
    .from("order_items")
    .select("id", { head: true, count: "exact" })
    .eq("product_id", productId);

  if ((count ?? 0) > 0) {
    const { error } = await supabase
      .from("products")
      .update({ activo: false, updated_at: new Date().toISOString() })
      .eq("id", productId);
    if (error) return { error: error.message };
    revalidatePath("/gestion/admin/productos");
    revalidatePath("/catalogo");
    return { ok: "Producto desactivado (tenía pedidos históricos)." };
  }

  const { error } = await supabase.from("products").delete().eq("id", productId);
  if (error) return { error: error.message };
  revalidatePath("/gestion/admin/productos");
  revalidatePath("/catalogo");
  return { ok: "Producto eliminado." };
}

export async function createCategory(nombre: string): Promise<{ id?: string; error?: string }> {
  const { supabase, error: authError } = await ensureAdmin();
  if (authError) return { error: authError };

  const cleanName = nombre.trim();
  if (!cleanName) return { error: "Nombre requerido." };
  const slug = toSlug(cleanName);
  if (!slug) return { error: "Nombre no válido." };

  const { data: existing } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (existing) return { id: existing.id };

  const { data: maxOrden } = await supabase
    .from("categories")
    .select("orden")
    .order("orden", { ascending: false })
    .limit(1)
    .maybeSingle();
  const nextOrden = (maxOrden?.orden ?? 0) + 10;

  const { data: inserted, error } = await supabase
    .from("categories")
    .insert({ nombre: cleanName, slug, orden: nextOrden, activo: true })
    .select("id")
    .single();
  if (error) return { error: error.message };

  revalidatePath("/gestion/admin/productos");
  revalidatePath("/gestion/admin/categorias");
  return { id: inserted.id };
}

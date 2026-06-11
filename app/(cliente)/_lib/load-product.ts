import type { SupabaseClient } from "@supabase/supabase-js";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type ProductRow = {
  id: string;
  slug: string | null;
  nombre: string;
  descripcion: string | null;
  precio: number;
  categoria: string | null;
  activo: boolean;
};

/**
 * Busca un producto por slug (columna slug) con fallback a id cuando el
 * parámetro tiene forma de UUID. Necesario porque los productos creados sin
 * slug usan el id como identificador en la URL del catálogo.
 */
export async function loadProductBySlugOrId(
  supabase: SupabaseClient,
  slugOrId: string
): Promise<ProductRow | null> {
  // 1. Intentar por columna slug.
  const { data: bySlug } = await supabase
    .from("products")
    .select("id, slug, nombre, descripcion, precio, categoria, activo")
    .eq("slug", slugOrId)
    .eq("activo", true)
    .maybeSingle();

  if (bySlug) return bySlug as ProductRow;

  // 2. Si tiene forma UUID, intentar por id (productos sin slug).
  if (UUID_RE.test(slugOrId)) {
    const { data: byId } = await supabase
      .from("products")
      .select("id, slug, nombre, descripcion, precio, categoria, activo")
      .eq("id", slugOrId)
      .eq("activo", true)
      .maybeSingle();
    return (byId as ProductRow) ?? null;
  }

  return null;
}

import { createClient } from "@/lib/supabase/server";

import { AccountLink } from "../_components/account-link";
import { RecentOrders } from "../_components/recent-orders";
import { CatalogClient, type CatalogCategory, type CatalogProduct } from "./_client";

export const dynamic = "force-dynamic";

export default async function CatalogoPage() {
  const supabase = await createClient();

  // Categorías activas (orden definido en /gestion/admin/categorias).
  const { data: categoriesRaw } = await supabase
    .from("categories")
    .select("id, slug, nombre, orden, activo")
    .eq("activo", true)
    .order("orden", { ascending: true });

  const categories: CatalogCategory[] = (categoriesRaw ?? []).map((c) => ({
    slug: c.slug,
    label: c.nombre,
  }));
  const activeSlugs = new Set(categories.map((c) => c.slug));

  // Productos activos.
  const { data: products } = await supabase
    .from("products")
    .select("id, slug, nombre, descripcion, precio, categoria")
    .eq("activo", true)
    .order("categoria", { ascending: true })
    .order("nombre", { ascending: true });

  // Stock disponible en este momento (suma de shifts abiertos − alquilado).
  const { data: stockRows } = await supabase.rpc("stock_disponible");
  const stockMap = new Map<string, number>(
    (stockRows ?? []).map((r) => [r.product_id, Number(r.disponible)])
  );

  // Marcamos como "Top ventas" los slugs destacados del handoff (sin nueva
  // columna en BD por ahora — es un valor estable del catálogo seedeado).
  const TOP_SLUGS = new Set([
    "silla-plegable",
    "sombrilla-clasica",
    "hamaca-ind",
  ]);

  const enriched: CatalogProduct[] = (products ?? [])
    .filter((p) => p.categoria && activeSlugs.has(p.categoria))
    .map((p) => ({
      id: p.id,
      slug: p.slug ?? p.id,
      nombre: p.nombre,
      descripcion: p.descripcion ?? "",
      precio: Number(p.precio),
      categoria: p.categoria ?? "extras",
      disponible: stockMap.get(p.id) ?? null,
      tag: TOP_SLUGS.has(p.slug ?? "") ? "Top ventas" : null,
    }));

  return (
    <CatalogClient
      products={enriched}
      categories={categories}
      recentOrdersSlot={<RecentOrders />}
      accountLinkSlot={<AccountLink />}
    />
  );
}

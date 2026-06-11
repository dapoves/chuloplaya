import { createClient } from "@/lib/supabase/server";

import { CategoriasTable } from "./_table";
import { AddCategoryForm } from "./_add-form";

export const dynamic = "force-dynamic";

export default async function CategoriasAdminPage() {
  const supabase = await createClient();

  const { data: categories } = await supabase
    .from("categories")
    .select("id, nombre, slug, orden, activo")
    .order("orden", { ascending: true });

  const productCounts = await supabase
    .from("products")
    .select("category_id");

  const counts = new Map<string, number>();
  for (const p of productCounts.data ?? []) {
    if (!p.category_id) continue;
    counts.set(p.category_id, (counts.get(p.category_id) ?? 0) + 1);
  }

  const rows = (categories ?? []).map((c) => ({
    ...c,
    count: counts.get(c.id) ?? 0,
  }));

  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="bt-mono text-[10px] uppercase tracking-[0.32em]" style={{ color: "#8AA3AD" }}>
          Admin · Catálogo
        </p>
        <h1 className="bt-display mt-1 text-2xl md:text-3xl" style={{ color: "#0E2A38" }}>
          Categorías
        </h1>
        <p className="mt-1 text-sm" style={{ color: "#4B6B78" }}>
          Crea, ordena y desactiva categorías del catálogo.
        </p>
      </header>
      <AddCategoryForm />
      <CategoriasTable rows={rows} />
    </div>
  );
}

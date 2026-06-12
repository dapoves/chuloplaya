import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { loadProductBySlugOrId } from "../../../../_lib/load-product";
import {
  ProductSheet,
  type ProductLite,
} from "../../../../_components/product-sheet";

export const dynamic = "force-dynamic";

const TOP_SLUGS = new Set([
  "silla-plegable",
  "sombrilla-clasica",
  "hamaca-ind",
]);

export default async function InterceptedProductSheet({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const [data, stockRows] = await Promise.all([
    loadProductBySlugOrId(supabase, slug),
    supabase.rpc("stock_disponible"),
  ]);
  if (!data) notFound();

  const stockMap = new Map<string, number>(
    (stockRows.data ?? []).map((r) => [r.product_id, Number(r.disponible)])
  );

  const product: ProductLite = {
    id: data.id,
    slug: data.slug ?? slug,
    nombre: data.nombre,
    descripcion: data.descripcion ?? "",
    precio: Number(data.precio),
    categoria: data.categoria ?? "extras",
    tag: TOP_SLUGS.has(data.slug ?? "") ? "Top ventas" : null,
    disponible: stockMap.has(data.id) ? stockMap.get(data.id)! : null,
  };

  return <ProductSheet product={product} />;
}

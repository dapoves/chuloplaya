import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

import { updateProduct, type ProductFormState } from "../actions";
import { ProductForm, type CategoryOption } from "../_form";

export default async function EditarProductoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: product }, { data: categories }] = await Promise.all([
    supabase
      .from("products")
      .select(
        "id, nombre, slug, descripcion, precio, imagen_url, category_id, activo"
      )
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("categories")
      .select("id, nombre, slug, activo")
      .order("orden", { ascending: true }),
  ]);

  if (!product) notFound();

  const opts: CategoryOption[] = (categories ?? [])
    .filter((c) => c.activo || c.id === product.category_id)
    .map((c) => ({ id: c.id, nombre: c.nombre, slug: c.slug }));

  const update = updateProduct.bind(null, product.id);
  const action: (
    prev: ProductFormState,
    formData: FormData
  ) => Promise<ProductFormState> = update;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Link href="/gestion/admin/productos">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="size-4" /> Volver
          </Button>
        </Link>
      </div>
      <h1 className="text-2xl font-bold">Editar producto</h1>
      <ProductForm
        action={action}
        submitLabel="Guardar cambios"
        categories={opts}
        initial={{
          id: product.id,
          nombre: product.nombre,
          slug: product.slug ?? "",
          descripcion: product.descripcion ?? "",
          precio: Number(product.precio),
          imagen_url: product.imagen_url ?? "",
          category_id: product.category_id ?? "",
          activo: product.activo,
        }}
      />
    </div>
  );
}

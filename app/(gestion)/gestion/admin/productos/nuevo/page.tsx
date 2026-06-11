import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

import { createProduct } from "../actions";
import { ProductForm, type CategoryOption } from "../_form";

export default async function NuevoProductoPage() {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("id, nombre, slug")
    .eq("activo", true)
    .order("orden", { ascending: true });

  const opts: CategoryOption[] = (categories ?? []) as CategoryOption[];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Link href="/gestion/admin/productos">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="size-4" /> Volver
          </Button>
        </Link>
      </div>
      <h1 className="text-2xl font-bold">Nuevo producto</h1>
      <ProductForm
        action={createProduct}
        submitLabel="Crear producto"
        categories={opts}
        initial={{
          nombre: "",
          slug: "",
          descripcion: "",
          precio: 0,
          imagen_url: "",
          category_id: "",
          activo: true,
        }}
      />
    </div>
  );
}

import Link from "next/link";
import { Pencil, Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createClient } from "@/lib/supabase/server";

import { DeleteProductButton } from "./_delete-button";

export const dynamic = "force-dynamic";

const EUR = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
});

export default async function ProductosAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; cat?: string; incl?: string }>;
}) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const cat = (sp.cat ?? "").trim();
  const includeInactive = sp.incl === "1";

  const supabase = await createClient();

  const { data: categories } = await supabase
    .from("categories")
    .select("id, slug, nombre, orden")
    .order("orden", { ascending: true });

  let query = supabase
    .from("products")
    .select("id, nombre, slug, precio, activo, category_id")
    .order("nombre", { ascending: true });

  if (!includeInactive) query = query.eq("activo", true);
  if (q) query = query.ilike("nombre", `%${q}%`);
  if (cat) query = query.eq("category_id", cat);

  const { data: products } = await query;

  const catById = new Map(
    (categories ?? []).map((c) => [c.id, c])
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Productos</h1>
          <p className="text-sm text-muted-foreground">
            Crea, edita o desactiva los productos del catálogo.
          </p>
        </div>
        <Link href="/gestion/admin/productos/nuevo">
          <Button>
            <Plus className="size-4" /> Nuevo producto
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent>
          <form className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1">
              <label htmlFor="q" className="text-xs text-muted-foreground">
                Buscar
              </label>
              <input
                id="q"
                name="q"
                defaultValue={q}
                placeholder="Nombre del producto"
                className="h-9 rounded-md border bg-transparent px-3 text-sm"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="cat" className="text-xs text-muted-foreground">
                Categoría
              </label>
              <select
                id="cat"
                name="cat"
                defaultValue={cat}
                className="h-9 rounded-md border bg-transparent px-2 text-sm"
              >
                <option value="">Todas</option>
                {(categories ?? []).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="incl"
                value="1"
                defaultChecked={includeInactive}
                className="size-4"
              />
              Incluir inactivos
            </label>
            <Button type="submit" variant="outline" size="sm">
              Aplicar
            </Button>
            {(q || cat || includeInactive) && (
              <Link
                href="/gestion/admin/productos"
                className="text-sm text-muted-foreground underline-offset-2 hover:underline"
              >
                Limpiar
              </Link>
            )}
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead className="text-right">Precio</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(products ?? []).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-6 text-center text-sm text-muted-foreground">
                    No hay productos para los filtros aplicados.
                  </TableCell>
                </TableRow>
              ) : (
                (products ?? []).map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <Link
                        href={`/gestion/admin/productos/${p.id}`}
                        className="font-medium hover:underline"
                      >
                        {p.nombre}
                      </Link>
                      <p className="text-xs text-muted-foreground">{p.slug}</p>
                    </TableCell>
                    <TableCell className="text-sm">
                      {p.category_id ? catById.get(p.category_id)?.nombre ?? "—" : "—"}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {EUR.format(Number(p.precio))}
                    </TableCell>
                    <TableCell>
                      {p.activo ? (
                        <Badge variant="success">Activo</Badge>
                      ) : (
                        <Badge variant="secondary">Inactivo</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/gestion/admin/productos/${p.id}`}>
                          <Button variant="outline" size="sm">
                            <Pencil className="size-3" /> Editar
                          </Button>
                        </Link>
                        <DeleteProductButton id={p.id} nombre={p.nombre} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

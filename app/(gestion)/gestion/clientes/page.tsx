import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

import { ClientesTable } from "./_table";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

export default async function ClientesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const page = Math.max(1, Number(sp.page ?? 1) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  const supabase = await createClient();

  const { data, error } = await supabase.rpc("list_clients_with_email", {
    p_search: q || undefined,
    p_limit: PAGE_SIZE,
    p_offset: offset,
  });

  const rows = data ?? [];
  const total = rows[0]?.total_count ? Number(rows[0].total_count) : 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const baseHref = (p: number) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (p > 1) params.set("page", String(p));
    const s = params.toString();
    return `/gestion/clientes${s ? `?${s}` : ""}`;
  };

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-bold">Clientes</h1>
        <p className="text-sm text-muted-foreground">
          Marca como fraudulento a los clientes que no devuelvan el material.
        </p>
      </header>

      <Card>
        <CardContent>
          <form className="flex flex-wrap items-end gap-3">
            <div className="flex flex-1 flex-col gap-1">
              <label className="text-xs text-muted-foreground" htmlFor="q">
                Buscar por nombre, teléfono o email
              </label>
              <input
                id="q"
                name="q"
                defaultValue={q}
                placeholder="nombre, 612 345 678 o email@..."
                className="h-9 rounded-md border bg-transparent px-3 text-sm"
              />
            </div>
            <Button type="submit" variant="outline" size="sm">
              Buscar
            </Button>
            {q ? (
              <Link
                href="/gestion/clientes"
                className="text-sm text-muted-foreground underline-offset-2 hover:underline"
              >
                Limpiar
              </Link>
            ) : null}
          </form>
        </CardContent>
      </Card>

      {error ? (
        <p className="text-sm text-destructive">Error: {error.message}</p>
      ) : (
        <ClientesTable clientes={rows} />
      )}

      {totalPages > 1 ? (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {total} clientes · página {page} de {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <Link href={baseHref(Math.max(1, page - 1))}>
              <Button variant="outline" size="sm" disabled={page === 1}>
                Anterior
              </Button>
            </Link>
            <Link href={baseHref(Math.min(totalPages, page + 1))}>
              <Button
                variant="outline"
                size="sm"
                disabled={page === totalPages}
              >
                Siguiente
              </Button>
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}

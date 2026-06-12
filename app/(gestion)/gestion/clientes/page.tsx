import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { createClient } from "@/lib/supabase/server";

import { ClientesTable } from "./_table";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

function buildPageHref(q: string, page: number) {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (page > 1) params.set("page", String(page));
  const s = params.toString();
  return `/gestion/clientes${s ? `?${s}` : ""}`;
}

function getPageRange(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "…")[] = [1];
  if (current > 3) pages.push("…");
  for (let p = Math.max(2, current - 1); p <= Math.min(total - 1, current + 1); p++) {
    pages.push(p);
  }
  if (current < total - 2) pages.push("…");
  pages.push(total);
  return pages;
}

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
  const pageRange = getPageRange(page, totalPages);

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-bold">Clientes</h1>
        <p className="text-sm text-muted-foreground">
          Clientes que han realizado al menos un pedido. Marca como fraudulento a los que no devuelvan el material.
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

      {totalPages > 1 && (
        <div className="flex flex-col items-center gap-2">
          <p className="text-xs text-muted-foreground">
            {total} cliente{total === 1 ? "" : "s"} · página {page} de {totalPages}
          </p>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href={buildPageHref(q, Math.max(1, page - 1))}
                  aria-disabled={page === 1}
                  className={page === 1 ? "pointer-events-none opacity-40" : undefined}
                />
              </PaginationItem>

              {pageRange.map((p, i) =>
                p === "…" ? (
                  <PaginationItem key={`ellipsis-${i}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                ) : (
                  <PaginationItem key={p}>
                    <PaginationLink
                      href={buildPageHref(q, p)}
                      isActive={p === page}
                    >
                      {p}
                    </PaginationLink>
                  </PaginationItem>
                )
              )}

              <PaginationItem>
                <PaginationNext
                  href={buildPageHref(q, Math.min(totalPages, page + 1))}
                  aria-disabled={page === totalPages}
                  className={page === totalPages ? "pointer-events-none opacity-40" : undefined}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}

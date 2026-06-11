import Link from "next/link";
import { ArrowLeft, Crown, Trophy } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function ColaboradoresRankingPage() {
  const supabase = await createClient();

  const { data: items } = await supabase
    .from("order_items")
    .select(
      "order_id, estado, cantidad, colaborador_asignado_id, product:products(precio)"
    )
    .not("colaborador_asignado_id", "is", null);

  const map = new Map<
    string,
    { pedidos: Set<string>; entregados: Set<string>; rechazados: Set<string>; dinero: number }
  >();

  for (const it of items ?? []) {
    const cid = it.colaborador_asignado_id!;
    if (!map.has(cid))
      map.set(cid, {
        pedidos: new Set(),
        entregados: new Set(),
        rechazados: new Set(),
        dinero: 0,
      });
    const entry = map.get(cid)!;
    entry.pedidos.add(it.order_id);
    entry.dinero += it.cantidad * Number(it.product?.precio ?? 0);

    if (it.estado === "entregado" || it.estado === "devuelto")
      entry.entregados.add(it.order_id);
    if (it.estado === "cancelado") entry.rechazados.add(it.order_id);
  }

  const colaboradorIds = [...map.keys()];

  const { data: profiles } =
    colaboradorIds.length > 0
      ? await supabase
          .from("profiles")
          .select("id, display_name")
          .in("id", colaboradorIds)
      : { data: [] };

  const profileMap = new Map(
    (profiles ?? []).map((p) => [p.id, p.display_name])
  );

  const ranking = colaboradorIds
    .map((id) => {
      const s = map.get(id)!;
      return {
        id,
        nombre: profileMap.get(id) ?? "Sin nombre",
        pedidos: s.pedidos.size,
        entregados: s.entregados.size,
        rechazados: s.rechazados.size,
        dinero: s.dinero,
      };
    })
    .sort((a, b) => b.pedidos - a.pedidos);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Link href="/gestion/pedidos">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="size-4" /> Volver
          </Button>
        </Link>
      </div>

      <header>
        <h1 className="text-2xl font-bold">Colaboradores</h1>
        <p className="text-sm text-muted-foreground">
          Ranking por número de pedidos gestionados. Pulsa en un colaborador
          para ver su historial.
        </p>
      </header>

      {ranking.length > 0 ? (
        <div className="flex flex-col gap-2">
          {ranking.map((c, i) => (
            <Link
              key={c.id}
              href={`/gestion/pedidos/colaboradores/${c.id}`}
              className="group"
            >
              <Card className="transition-colors group-hover:border-primary/40">
                <CardContent className="flex items-center gap-4 py-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-bold">
                    {i === 0 ? (
                      <Crown className="size-5 text-amber-500" />
                    ) : i < 3 ? (
                      <Trophy className="size-4 text-muted-foreground" />
                    ) : (
                      <span className="text-muted-foreground">{i + 1}</span>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col gap-0.5 min-w-0">
                    <span className="truncate text-sm font-semibold">
                      {c.nombre}
                    </span>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span>{c.pedidos} pedido{c.pedidos === 1 ? "" : "s"}</span>
                      <span>·</span>
                      <span>{c.entregados} entregado{c.entregados === 1 ? "" : "s"}</span>
                      {c.rechazados > 0 && (
                        <>
                          <span>·</span>
                          <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                            {c.rechazados} rechazado{c.rechazados === 1 ? "" : "s"}
                          </Badge>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-base font-bold text-primary tabular-nums">
                      {c.dinero.toFixed(0)}€
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      total
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            Aún no hay colaboradores con pedidos asignados.
          </CardContent>
        </Card>
      )}
    </div>
  );
}

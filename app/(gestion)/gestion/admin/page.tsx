import Link from "next/link";
import {
  AlertTriangle,
  CircleDollarSign,
  Package,
  Settings,
  ShoppingBag,
  Tag,
  UserCog,
  Users,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";

import { BarChart } from "./_components/bar-chart";
import { KpiCard } from "./_components/kpi-card";

export const dynamic = "force-dynamic";

const EUR = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

function daysAgoIso(days: number) {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString();
}

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const since7 = daysAgoIso(6); // hoy + 6 anteriores = 7 días
  const since30 = daysAgoIso(29);
  const todayStart = daysAgoIso(0);

  const [
    productsRes,
    todayOrdersRes,
    last7Res,
    last30Res,
    allOrdersRes,
    profilesRes,
  ] = await Promise.all([
    supabase.from("products").select("id, nombre, precio"),
    supabase
      .from("orders")
      .select("id, order_items(product_id, cantidad, estado)")
      .gte("created_at", todayStart),
    supabase
      .from("orders")
      .select("id, created_at")
      .gte("created_at", since7),
    supabase
      .from("orders")
      .select("id, order_items(product_id, cantidad, estado)")
      .gte("created_at", since30),
    supabase
      .from("orders")
      .select("id, order_items(product_id, cantidad, estado)"),
    supabase
      .from("profiles")
      .select("id, is_fraudulent")
      .eq("role", "cliente"),
  ]);

  const products = productsRes.data ?? [];
  const productById = new Map(products.map((p) => [p.id, p]));

  // KPI 1: ingresos potenciales de hoy (ignorando cancelados/devueltos)
  let ingresosHoy = 0;
  for (const o of todayOrdersRes.data ?? []) {
    for (const it of o.order_items ?? []) {
      if (it.estado === "cancelado") continue;
      const p = productById.get(it.product_id);
      if (!p) continue;
      ingresosHoy += Number(p.precio) * Number(it.cantidad);
    }
  }

  // KPI 2: ingresos totales (todos los pedidos, sin cancelados)
  let ingresosTotal = 0;
  for (const o of allOrdersRes.data ?? []) {
    for (const it of o.order_items ?? []) {
      if (it.estado === "cancelado") continue;
      const p = productById.get(it.product_id);
      if (!p) continue;
      ingresosTotal += Number(p.precio) * Number(it.cantidad);
    }
  }

  // KPI 3: clientes
  const clientes = profilesRes.data ?? [];
  const totalClientes = clientes.length;
  const clientesFlagged = clientes.filter((c) => c.is_fraudulent).length;
  const ratioFraude = totalClientes
    ? Math.round((clientesFlagged / totalClientes) * 1000) / 10
    : 0;

  // KPI 4: pedidos hoy
  const pedidosHoy = (todayOrdersRes.data ?? []).length;

  // Chart 1: pedidos por día últimos 7 días
  const days7: { label: string; value: number; sub?: string }[] = [];
  const dayKeyFmt = new Intl.DateTimeFormat("es-ES", {
    weekday: "short",
    day: "2-digit",
  });
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setUTCHours(0, 0, 0, 0);
    d.setUTCDate(d.getUTCDate() - i);
    const key = d.toISOString().slice(0, 10);
    const count = (last7Res.data ?? []).filter((o) =>
      o.created_at.startsWith(key)
    ).length;
    days7.push({ label: dayKeyFmt.format(d), value: count });
  }

  // Chart 2: top 5 productos últimos 30 días (unidades alquiladas)
  const productTotals = new Map<string, number>();
  for (const o of last30Res.data ?? []) {
    for (const it of o.order_items ?? []) {
      if (it.estado === "cancelado") continue;
      productTotals.set(
        it.product_id,
        (productTotals.get(it.product_id) ?? 0) + Number(it.cantidad)
      );
    }
  }
  const top5 = [...productTotals.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([pid, qty]) => ({
      label: productById.get(pid)?.nombre ?? "Desconocido",
      value: qty,
      sub: "uds",
    }));

  const shortcuts = [
    { href: "/gestion/admin/productos", label: "Productos", icon: Package },
    { href: "/gestion/admin/categorias", label: "Categorías", icon: Tag },
    { href: "/gestion/admin/usuarios", label: "Usuarios", icon: UserCog },
    { href: "/gestion/admin/settings", label: "Ajustes", icon: Settings },
  ];

  return (
    <div className="flex flex-col gap-8">
      <header className="flex items-end justify-between gap-4">
        <div>
          <p className="bt-mono text-[10px] uppercase tracking-[0.32em] text-[color:var(--bt-ink-faint)]">
            Capitanía · Panel
          </p>
          <h1 className="bt-display mt-1 text-3xl md:text-4xl text-[color:var(--bt-ink)]">
            Resumen de la jornada
          </h1>
          <p className="mt-1 text-sm text-[color:var(--bt-ink-soft)]">
            Actividad, accesos rápidos y telemetría operativa.
          </p>
        </div>
        <div className="hidden md:block bt-rule w-40" />
      </header>

      {/* Atajos */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <span className="bt-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--bt-ink-faint)]">
            §1 · Accesos
          </span>
          <div className="flex-1 bt-rule" />
        </div>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          {shortcuts.map((s) => {
            const Icon = s.icon;
            return (
              <Link
                key={s.href}
                href={s.href}
                className="group flex items-center gap-2 rounded-[4px] border border-[color:var(--bt-line-strong)] bg-[color:var(--bt-card)] p-3 transition-colors hover:bg-[color:var(--bt-ink)] hover:text-[color:var(--bt-paper)]"
              >
                <Icon className="size-4" />
                <span className="bt-stencil text-[11px]">{s.label}</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* KPIs */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <span className="bt-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--bt-ink-faint)]">
            §2 · Telemetría
          </span>
          <div className="flex-1 bt-rule" />
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <KpiCard
            tone="primary"
            label="Ingresos hoy"
            value={EUR.format(ingresosHoy)}
            hint={`${pedidosHoy} pedidos`}
            icon={<CircleDollarSign className="size-5" />}
          />
          <KpiCard
            tone="accent"
            label="Ingresos totales"
            value={EUR.format(ingresosTotal)}
            hint="acumulado"
            icon={<ShoppingBag className="size-5" />}
          />
          <KpiCard
            tone="success"
            label="Clientes"
            value={totalClientes}
            hint="con perfil"
            icon={<Users className="size-5" />}
          />
          <KpiCard
            tone="coral"
            label="Fraude"
            value={`${ratioFraude}%`}
            hint={`${clientesFlagged} marcados`}
            icon={<AlertTriangle className="size-5" />}
          />
        </div>
      </section>

      {/* Gráficos */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <span className="bt-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--bt-ink-faint)]">
            §3 · Bitácora gráfica
          </span>
          <div className="flex-1 bt-rule" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <ChartCard
            kicker="Serie temporal"
            title="Pedidos · últimos 7 días"
          >
            <BarChart data={days7} />
          </ChartCard>
          <ChartCard
            kicker="Ranking 30d"
            title="Top productos"
          >
            <BarChart data={top5} />
          </ChartCard>
        </div>
      </section>
    </div>
  );
}

function ChartCard({
  kicker,
  title,
  children,
}: {
  kicker: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <article className="rounded-[4px] border border-[color:var(--bt-line-strong)] bg-[color:var(--bt-card)] shadow-[0_1px_0_var(--bt-line)]">
      <header className="flex items-end justify-between gap-2 border-b border-dashed border-[color:var(--bt-line-strong)] px-5 py-4">
        <div>
          <p className="bt-mono text-[9px] uppercase tracking-[0.22em] text-[color:var(--bt-ink-faint)]">
            {kicker}
          </p>
          <h3 className="bt-display mt-0.5 text-lg text-[color:var(--bt-ink)]">{title}</h3>
        </div>
      </header>
      <div className="p-5">{children}</div>
    </article>
  );
}

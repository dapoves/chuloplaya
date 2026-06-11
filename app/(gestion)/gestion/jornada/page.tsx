import { createClient } from "@/lib/supabase/server";

import { JornadaActiva } from "./_active";
import { OpenShiftCard } from "./_open";
import type { Participant } from "./_team";
import type { StockSnapshot } from "./_form";

export type Category = { id: string; nombre: string };

export default async function JornadaPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const today = new Date().toLocaleDateString("sv-SE", {
    timeZone: "Europe/Madrid",
  });

  const [{ data: shift }, { data: products }, { data: categories }] = await Promise.all([
    supabase
      .from("shifts")
      .select("id, hora_inicio, abierta_por")
      .eq("fecha", today)
      .eq("activo", true)
      .maybeSingle(),
    supabase
      .from("products")
      .select("id, nombre, precio, category_id")
      .eq("activo", true)
      .order("nombre"),
    supabase
      .from("categories")
      .select("id, nombre")
      .eq("activo", true)
      .order("orden"),
  ]);

  const cats: Category[] = categories ?? [];

  if (!shift) {
    const { data: lastShift } = await supabase
      .from("shifts")
      .select("id, fecha")
      .eq("activo", false)
      .order("fecha", { ascending: false })
      .limit(1)
      .maybeSingle();

    let initial: Record<string, number> = {};
    if (lastShift) {
      const { data: lastStock } = await supabase
        .from("shift_stock")
        .select("product_id, cantidad")
        .eq("shift_id", lastShift.id);
      initial = Object.fromEntries(
        (lastStock ?? []).map((s) => [s.product_id, s.cantidad])
      );
    }

    return (
      <div className="flex flex-col gap-6">
        <header>
          <p
            className="bt-mono text-[10px] uppercase tracking-[0.32em]"
            style={{ color: "#8AA3AD" }}
          >
            Cuaderno · 01
          </p>
          <h1
            className="bt-display mt-1 text-2xl md:text-3xl"
            style={{ color: "#0E2A38" }}
          >
            Jornada de hoy
          </h1>
          <p className="mt-1 text-sm" style={{ color: "#4B6B78" }}>
            Aún no hay jornada abierta. Carga el stock del día para empezar.
          </p>
        </header>
        <OpenShiftCard
          products={products ?? []}
          categories={cats}
          initial={initial}
          lastDateISO={lastShift?.fecha ?? null}
        />
      </div>
    );
  }

  const [{ data: stock }, { data: rawParticipants }, { data: rawSnapshots }, abiertaPorProfile] =
    await Promise.all([
      supabase
        .from("shift_stock")
        .select("product_id, cantidad")
        .eq("shift_id", shift.id),
      supabase
        .from("shift_participants")
        .select(
          "colaborador_id, joined_at, last_seen_at, left_at, profiles!shift_participants_colaborador_id_fkey ( display_name )"
        )
        .eq("shift_id", shift.id),
      supabase.rpc("stock_disponible"),
      shift.abierta_por
        ? supabase
            .from("profiles")
            .select("display_name")
            .eq("id", shift.abierta_por)
            .maybeSingle()
        : Promise.resolve({ data: null }),
    ]);

  type RawP = {
    colaborador_id: string;
    joined_at: string;
    last_seen_at: string;
    left_at: string | null;
    profiles: { display_name: string | null } | null;
  };

  const participants: Participant[] = ((rawParticipants ?? []) as unknown as RawP[]).map(
    (r) => ({
      colaborador_id: r.colaborador_id,
      joined_at: r.joined_at,
      last_seen_at: r.last_seen_at,
      left_at: r.left_at,
      display_name: r.profiles?.display_name ?? null,
    })
  );

  const stockMap: Record<string, number> = Object.fromEntries(
    (stock ?? []).map((s) => [s.product_id, s.cantidad])
  );

  const snapshots: Record<string, StockSnapshot> = Object.fromEntries(
    (rawSnapshots ?? []).map((s) => [
      s.product_id,
      {
        product_id: s.product_id,
        cargado: Number(s.total_cargado),
        alquilado: Number(s.total_alquilado),
        disponible: Number(s.disponible),
      },
    ])
  );

  return (
    <div className="flex flex-col gap-6">
      <header>
        <p
          className="bt-mono text-[10px] uppercase tracking-[0.32em]"
          style={{ color: "#8AA3AD" }}
        >
          Cuaderno · 01
        </p>
        <h1
          className="bt-display mt-1 text-2xl md:text-3xl"
          style={{ color: "#0E2A38" }}
        >
          Jornada de hoy
        </h1>
        <p className="mt-1 text-sm" style={{ color: "#4B6B78" }}>
          Stock compartido y equipo en tiempo real.
        </p>
      </header>

      <JornadaActiva
        shiftId={shift.id}
        horaInicio={shift.hora_inicio}
        abiertaPor={
          (abiertaPorProfile as { data: { display_name: string | null } | null }).data
            ?.display_name ?? null
        }
        products={products ?? []}
        categories={cats}
        stockMap={stockMap}
        snapshots={snapshots}
        participants={participants}
        userId={user.id}
      />
    </div>
  );
}
